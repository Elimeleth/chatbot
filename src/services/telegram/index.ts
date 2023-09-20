import { Telegraf } from "telegraf"
import { PATH_CONFIGURATIONS, TELEGRAM_API_BOT } from "../../shared/constants/enviroments"
import { loader } from "../../helpers/loader"
import { logger } from "../logs/winston.log"
import { provider } from "../../lib/whatsappWebJs"
import { assert } from "console"

class TelegramChannelService {
    service!: Telegraf
    forum_id: string = loader('FORUM_ID', PATH_CONFIGURATIONS)

    constructor(private token: string) {
        this.service = new Telegraf(this.token)
        this.service.use((ctx, next) => {
            
            if (ctx.message?.is_topic_message) {
                // @ts-ignore
                ctx.message.topic_name = ctx.message.reply_to_message.forum_topic_created.name
                // @ts-ignore
                ctx.message.topic_message = ctx.message.text
            }

            next();
        })

        this.handleError();
    }

    private handleError () {
        this.service.catch((error, ctx) => {
            logger.error({ info: 'Telegram Error', error })

            console.log({ ctx: ctx.update })
        })
    }

    private alert_new_topic(message: string, invite_link: string) {
        let chat_ids = loader('CHAT_IDS', PATH_CONFIGURATIONS) as Array<string>
        if (!Boolean(chat_ids)) return
        chat_ids = Array.isArray(chat_ids) ? chat_ids : [chat_ids]
        
        for (const id of chat_ids) {
            this.service.telegram.sendMessage(id, message, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Atender', url: invite_link }]
                    ],
                },
            })
        }
    }

    async send (to: string, message: any) {
        if (!provider._isConnected) return
        return await provider.send(to, message)
    }

    private async hear() {
        this.service.on('message', async (ctx) => {
            console.log('message', { ctx: ctx.message })
            // @ts-ignore
            if (ctx.message.text && ctx.message.text.match(/(salir|close|cerrar|terminar)/gim)) {
                // @ts-ignore
                this.delete_topic(ctx.message.message_thread_id)
            }
            // @ts-ignore
            if (ctx.message.topic_name) {
                // @ts-ignore
                // return await this.send(`${ctx.message.topic_name}@c.us`, ctx.message.topic_message)
            }
        })
    }

    private action () {
        this.service.action(/[a-zA-Z]/gim, (ctx) => {
            console.log('action', { ctx: ctx.update })
        })
    }

    async create_topic(phone_id: string) {
        const link = await this.service.telegram.createChatInviteLink(this.forum_id, {
            name: 'Biyuyo Foro',
            creates_join_request: true,
        })
        
        const topic = await this.service.telegram.createForumTopic(this.forum_id, phone_id)
        
        if (topic.name) this.alert_new_topic(
            `NUEVO TICKET CREADO!\n\n User: **${phone_id}**`,
            link.invite_link
        )
    }

    private async delete_topic(message_thread_id: number) {
        return await this.service.telegram.deleteForumTopic(this.forum_id, message_thread_id)
    }

    async run() {
        try {
            this.hear()
            // this.action()
            console.log('*** TELEGRAM CHANNEL RUNNING ***')
            
            await this.service.launch()
        } catch (error) {
            logger.error({ info: 'telegram_error', error })
        }

    }

}

export const telegra_channel = new TelegramChannelService(TELEGRAM_API_BOT)