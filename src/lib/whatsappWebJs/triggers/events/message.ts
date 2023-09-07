import { Message } from "whatsapp-web.js";
import { PipeChat } from "../../../../shared/interfaces/chat";
import { logger } from "../../../../services/logs/winston.log";

const filterMessage = (msg: Message): boolean => !!(
    msg.fromMe ||
    !msg.from.includes('4126236128') ||
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
        
        // if (chat) chat.call(msg.body, msg)
    }
}

export const message_create = {
    name: 'message_create',
    cb: async (msg: Message) => {
        if (msg.fromMe) return false;
    }
}

export const unread_count = {}

export const message_revoke_everyone = {}

export const message_revoke_me = {}