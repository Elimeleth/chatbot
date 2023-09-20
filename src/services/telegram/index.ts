import { Telegraf } from "telegraf"
import { PATH_CONFIGURATIONS, TELEGRAM_API_BOT } from "../../shared/constants/enviroments"
import { loader } from "../../helpers/loader"
import { logger } from "../logs/winston.log"
import { provider } from "../../lib/whatsappWebJs"

class TelegramChannelService {
    service!: Telegraf
    forum_id: string = loader('FORUM_ID', PATH_CONFIGURATIONS)

    constructor(private token: string) {
        this.service = new Telegraf(this.token)
        this.handleError();
    }

    private handleError () {
        this.service.catch((error, ctx) => {
            console.log('error catch', { error })
            logger.error({ info: 'Telegram Error', error })

            console.log({ ctx: JSON.stringify(ctx.message, undefined, 1) })
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

    async send (to: string, message: any, options: any) {
        if (!provider._isConnected) return
    
        if (options?.media_url)  {
            return await provider.sendMedia(to, options.media_url, {
                caption: message,
                sendAudioAsVoice: options.is_voice || false
            })
        }

        return await provider.send(to, message, options)
    }

    private middleware () {
        this.service.use( async (ctx: any, next) => {
            
            if (ctx.message?.is_topic_message) {
                if (ctx.message.photo || ctx.message.voice) {
                    const file_id = ctx.message.photo ? 
                        ctx.message.photo[ctx.message.photo.length - 1].file_id : ctx.message.voice.file_id;
                    
                    const media = await this.service.telegram.getFileLink(file_id)
    
                    ctx.message.media_url = media.href
                    ctx.message.is_voice = Boolean(ctx.message?.voice)
                }

                ctx.message.topic_name = ctx.message.reply_to_message.forum_topic_created.name
                ctx.message.topic_message = ctx.message.text
            }

            next();
        })

    }

    private async hear() {
        this.service.on('message', async (ctx: any) => {
            console.log('message', JSON.stringify(ctx.message, undefined, 1))
        
            // if (ctx.message.text && ctx.message.text.match(/(salir|close|cerrar|terminar)/gim)) {
            //     this.delete_topic(ctx.message.message_thread_id)
            // }
            
            // if (ctx.message.topic_name) {
            //     return await this.send(`${ctx.message.topic_name}@c.us`, ctx.message.topic_message, {
            //         media_url: ctx.message?.media_url,
            //         is_voice: ctx.message?.is_voice
            //     })
            // }
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
            this.middleware()
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