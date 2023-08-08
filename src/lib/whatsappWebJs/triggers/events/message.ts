import { Message } from "whatsapp-web.js";
import { PipeChat } from "../../../../shared/interfaces/chat";
import { clean } from "../../../../helpers/clean-message";

export const message = {
    name: 'message',
    cb: async (msg: Message, chat: PipeChat|null) => {
        msg.body = clean(msg.body)
        if (chat) chat.call(msg.body, msg)
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