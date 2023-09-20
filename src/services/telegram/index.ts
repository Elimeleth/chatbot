import { Telegraf } from "telegraf"
import { PATH_CONFIGURATIONS, TELEGRAM_API_BOT } from "../../shared/constants/enviroments"
import { loader } from "../../helpers/loader"
import { logger } from "../logs/winston.log"
import { provider } from "../../lib/whatsappWebJs"
import { cache } from "../cache/history-cache"

class TelegramChannelService {
    service!: Telegraf
    forum_id: string = loader('FORUM_ID', PATH_CONFIGURATIONS)
    topics = new Map<string, number>()

    constructor(private token: string) {
        this.service = new Telegraf(this.token)
        this.handleError();
    }

    private handleError() {
        this.service.catch((error, _) => {
            logger.error({ info: 'Telegram Error', error })
        })
    }

    private alert_new_topic(message: string, invite_link: string) {
        let chat_ids = loader('CHAT_IDS', PATH_CONFIGURATIONS) as Array<string>
        if (!Boolean(chat_ids)) return
        chat_ids = Array.isArray(chat_ids) ? chat_ids : [chat_ids]

        for (const id of chat_ids) {
            try {
                this.service.telegram.sendMessage(id, message, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Atender', url: invite_link }]
                        ],
                        remove_keyboard: true,
                        one_time_keyboard: true
                    },
                })
            } catch (error) {
                logger.error({ info: 'alert error topic telegram', error })
            }
        }
    }

    async send(args: {
        type: 'audio' | 'text' | 'image',
        topic: string,
        message: string,
        content?: {
            url: string,
            filename: string,
        }
    }) {
        const { type, content, message, topic } = args
        
        if (!this.topics.has(topic)) return
        
        try {
            const message_thread_id = this.topics.get(topic)
            switch (type) {
                case 'audio':
                    // @ts-ignore
                    return await this.service.telegram.sendAudio(this.forum_id, content, {
                        message_thread_id,
                        caption: message
                    })
                case 'image':
                    // @ts-ignore
                    return await this.service.telegram.sendPhoto(this.forum_id, content, {
                        message_thread_id,
                        caption: message
                    })
                case 'text':
                    return await this.service.telegram.sendMessage(this.forum_id, message, {
                        message_thread_id
                    })
                default:
                    return await this.service.telegram.sendMessage(this.forum_id, message, {
                        message_thread_id
                    })
            }
        } catch (error) {
            logger.error({ info: 'error sending message', error })
        }
    }

    private async delivery(to: string, message: any, options: any) {
        if (!provider._isConnected) return

        if (options?.media_url) {
            return await provider.sendMedia(to, options.media_url, {
                caption: message,
                sendAudioAsVoice: options.is_voice || false
            })
        }

        return await provider.send(to, message, options)
    }

    private middleware() {
        this.service.use(async (ctx: any, next) => {

            if (ctx.message?.is_topic_message) {
                if (ctx.message.photo || ctx.message.voice) {
                    const file_id = ctx.message.photo ?
                        ctx.message.photo[ctx.message.photo.length - 1].file_id : ctx.message.voice.file_id;

                    const media = await this.service.telegram.getFileLink(file_id)

                    ctx.message.media_url = media.href
                    ctx.message.is_voice = Boolean(ctx.message?.voice)
                }

                ctx.message.topic_name = ctx.message.reply_to_message?.forum_topic_created?.name
                ctx.message.topic_message = ctx.message.text
            }

            next();
        })

    }

    private async hear() {
        this.service.on('message', async (ctx: any) => {
            if (ctx.message.text && ctx.message.text.match(/(salir|close|cerrar|terminar)/gim)) {
                return this.delete_topic(ctx.message.message_thread_id)
            }

            if (ctx.message.topic_name) {
                if (!this.topics.has(ctx.message.topic_name)) {
                    this.topics.set(ctx.message.topic_name, ctx.message.message_thread_id)
                }
                return await this.delivery(`${ctx.message.topic_name}@c.us`, ctx.message.topic_message, {
                    media_url: ctx.message?.media_url,
                    is_voice: ctx.message?.is_voice
                })
            }
        })
    }

    private action() {
        this.service.action(/[a-zA-Z]/gim, (ctx) => {
        })
    }

    private command() {
        this.service.command('id', (ctx) => {
            return ctx.reply(String(ctx.chat.id))
        })
    }

    async manage_topic(phone_id: string, delete_topic: boolean = false) {
        if (this.topics.has(phone_id)) {
            if (delete_topic) this.delete_topic(Number(this.topics.get(phone_id)));
            return null
        }

        try {
            const link = await this.service.telegram.createChatInviteLink(this.forum_id, {
                name: 'Biyuyo Foro',
                creates_join_request: true,
            })

            const topic = await this.service.telegram.createForumTopic(this.forum_id, phone_id)
            this.topics.set(topic.name, topic.message_thread_id)
            this.send({
                topic: topic.name,
                message: 'Historial de mensajes:\n\n'+cache.user(`${phone_id}@c.us`).history.join('\n\n'),
                type: 'text'
            })
            this.alert_new_topic(
                `NUEVO TICKET CREADO!\n\n User: **${phone_id}**`,
                link.invite_link
            )
        } catch (error) {
            logger.error({ info: 'telegra topic creating got an error', error })
        }
    }

    private async delete_topic(message_thread_id: number) {
        return await this.service.telegram.deleteForumTopic(this.forum_id, message_thread_id)
    }

    async run() {
        try {
            this.middleware()
            this.hear()
            this.command()
            console.log('*** TELEGRAM CHANNEL RUNNING ***')

            await this.service.launch()
        } catch (error) {
            logger.error({ info: 'telegram_error', error })
        }

    }

}

export const telegram_channel = new TelegramChannelService(TELEGRAM_API_BOT)