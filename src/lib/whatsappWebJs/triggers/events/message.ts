import { Message } from "whatsapp-web.js";
import { PipeChat } from "../../../../shared/interfaces/chat";
import { logger } from "../../../../services/logs/winston.log";
import { create_ticket_support } from "../../../../services/ticket";
import { distanceIntoDates, timedelta } from "../../../../helpers/date";

const filterMessage = (msg: Message): boolean => !!(
    msg.fromMe ||
    !msg.from.match(/(4126236128|4124964540)/gim) ||
    msg.hasMedia ||
    msg.isGif ||
    msg.isStatus ||
    msg.inviteV4 ||
    msg.isStarred ||
    !msg.from.includes('@c.us')
)

export const message = {
    name: 'message',
    cb: async (msg: Message, chat: PipeChat|null) => {
        if (filterMessage(msg)) return false;
        logger.info({ info: 'message_create', msg })
        // @ts-ignore
        msg.phone = msg.from.split("@")[0]
        // @ts-ignore
        msg.action_bot_time = process.hrtime([distanceIntoDates(msg.timestamp * 1000, Date.now(), 'seconds'), '0'])
        // @ts-ignore
        msg.action_api_time = process.hrtime()
        // @ts-ignore
        msg.timedelta = timedelta(msg.timestamp)
        // @ts-ignore
        msg.haveTicketSupport = create_ticket_support.haveTicket(msg.phone)
        if (chat) chat.call(msg.body, msg)
    }
}

export const message_create = {
    name: 'message_create',
    cb: async (msg: Message) => {
        if (msg.fromMe) return false;
        if (msg.hasMedia) {
            
            const multimedia = {
                id: msg.id._serialized,
                ...(await msg.downloadMedia())
            }
            
            await create_ticket_support.create({
                phone: msg.from.split('@')[0],
                message: '(Contiene multimedia)'
            }, multimedia)
        }
    }
}

export const unread_count = {}
export const message_revoke_everyone = {}
export const message_revoke_me = {}