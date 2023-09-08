import { Client, MessageContent, MessageMedia, MessageSendOptions } from "whatsapp-web.js";
import { BaseChatService, PipeChat } from "../../shared/interfaces/chat";
import { CLIENT_OPTIONS } from "../../shared/constants/whatsapp-web";
import { delay } from "../delay";
import { assert } from "../assertions";
import * as job from "node-cron"
import { CentinelWhatsAppWeb } from "./centinel";
import { cache } from "../../services/cache/history-cache";
import { httpClient } from "../../services/http";
import { PATH_CONFIGURATIONS, URL_ACTIVE_PROMOTIONS } from "../../shared/constants/enviroments";
import { loader } from "../../helpers/loader";


export class WhatsAppWebService extends BaseChatService {
    private client!: Client
    private chat!: PipeChat
    private isConnected = false

    constructor(bot_name: string) {
        super(bot_name)
        this.client = this.init()
    }
    
    get version () {
        return this.client.getWWebVersion()
    }

    get _client () {
        return this.client
    }

    get _isConnected () {
        return this.isConnected
    }

    private init () {
        return new Client(CLIENT_OPTIONS)
    }

    daemon () {
        return this
    }

    async listen() {
        const service = await this.client.initialize()
        console.log(`*** USING WHATSAPP WEB VERSION ${await this.version} ***`)
        const centinel = new CentinelWhatsAppWeb(this.chat as any)
        this.cron(centinel.schedule, async () => await centinel.task())
        this.isConnected = true
        return service
    }


    cron(schedule: string, cb: any): void {
        const sch = job.schedule(schedule, cb, {
            name: 'get-chats',
            recoverMissedExecutions: true,
            runOnInit: false,
            scheduled: false
        })

        sch.start()
    }

    attachEvents(events: {
        name: string;
        cb: any
    }[]) {
        for (const event of events) {
            this.client.on(event.name, (...args) => {
                event.cb(args[0], this.chat || null);
            })
        }
    }

    pipe (chat: PipeChat) {
        this.chat = chat
    }
    
    async status (_status: 'seen'|'typing'|'stop', chatId: string) {
        const chat = await this.client.getChatById(chatId)
        await (async (status: string) => {
            switch (status) {
                case "seen":
                    return await chat.sendSeen()
                case "typing": {
                    setTimeout(async () => await chat.clearState(), 8000)
                    return await chat.sendStateTyping()
                }
                case "stop":
                    return await chat.clearState()
            }
        })(_status)
    }
    
    async sendContact (phone: string, message: string, contactId: string, messageSendOptions: MessageSendOptions | undefined = {}) {
        const contact = await this.client.getContactById(contactId)
        this.send(phone, message, messageSendOptions)
        this.send(phone, contact, messageSendOptions)
    }

    async sendMedia (phone: string, pathFileMedia: string, messageSendOptions: MessageSendOptions | undefined = {}) {
        const media = MessageMedia.fromFilePath(pathFileMedia)
        return this.send(phone, media, messageSendOptions)
    }

    async send(to: string, message: MessageContent, messageSendOptions: MessageSendOptions | undefined = {}) {
        assert(to.includes("@c.us"), "to must include @c.us")
        
        await delay(150)
        await this.client.sendPresenceAvailable()
        await this.status('typing', to)

        // @ts-ignore
        if (messageSendOptions?.path_media) {
            // @ts-ignore
            messageSendOptions.media =  MessageMedia.fromFilePath(messageSendOptions.path_media)
            messageSendOptions.caption = message as string

            // @ts-ignore
            delete messageSendOptions.path_media
        }else {
            const isPromotionable = await httpClient({
                url: URL_ACTIVE_PROMOTIONS,
                method: 'GET'
            })
    
            if (isPromotionable.send_image_promotion) {
                messageSendOptions.media =  MessageMedia.fromFilePath(loader("PATH_PROMOTION_AVAILABLE", PATH_CONFIGURATIONS))
                messageSendOptions.caption = message as string
            }
        }
        

        const ack = this.client.sendMessage(to, message, {
            sendSeen: true,
            ...messageSendOptions
        })

        await this.status('stop', to)
        await this.client.sendPresenceUnavailable()
        return ack
    }
}

export const serviceWhatsApp = new WhatsAppWebService('Biyuyo Bot').daemon()