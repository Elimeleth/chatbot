import { Chat, Client, Message } from "whatsapp-web.js";
import { distanceIntoDates, _isToday } from "../../../helpers/date";
import { loader } from "../../../helpers/loader";
import { PATH_CONFIGURATIONS } from "../../../shared/constants/enviroments";
import { WhatsAppWebService } from "..";
import { ChatFactory } from "../..";
import { logger } from "../../../services/logs/winston.log";
import { cache } from "../../../services/cache/history-cache";
import { delay } from "../../delay";
// import { user_cache } from "./user_cache";
/**
 * 
 * @param {*} params
* @param {*} listOfOptions
 * BUSQUEDA CONSTANTE DE CHATS PENDIENTES AL HABER INSIDENCIA EN ESTADOS DEL BOT 
 */
const unreads = async (client: Client) => {
	try {
		const chats = await client.getChats()

		if (!chats.length) return []

		return chats.filter(filterChat)

	} catch (error) {
		return []
	}
};

const filterChat = (chat: Chat): boolean => {
	const evaluate_difference = loader("GET_CHATS_EVALUATE_DIFF", PATH_CONFIGURATIONS)
	if (!chat?.lastMessage) return false
	
	return (
		_isToday(chat.timestamp * 1000)
		&& Boolean(chat.lastMessage.type === 'chat')
		&& !chat.isGroup
		&& !chat.id.user.includes('status')
		&& !chat.lastMessage.from.includes('@g.us')
		&& !chat.lastMessage.fromMe
		&& !chat.lastMessage.hasReaction
		&& chat.lastMessage.from.match(/4126236128/gim)
		&& ['chat', 'ciphertext', 'e2e_notification'].includes(chat.lastMessage.type)
		&& distanceIntoDates(chat.lastMessage.timestamp * 1000, Date.now(), 'seconds') > Number(evaluate_difference)
	) as boolean
}

const fetch_messages = async (chat: Chat) => {
	const messages = await chat.fetchMessages({ limit: 1, fromMe: false })

	if (!messages.length) return null

	const message = messages[0]
	if (!message || message.fromMe) return null

	return message
}

export class CentinelWhatsAppWeb<T>  {
	schedule = loader("GET_CHATS_CRON_TIME_SECONDS", PATH_CONFIGURATIONS)
	isReading = false
	
	constructor(private chat: ChatFactory<T>) { }

	async task() {	
		if (this.isReading) return
		const chats = await unreads(this.chat.client)
		
		this.isReading = true
		
		if (chats.length > 0) {
			logger.info({ info: 'unreads chats', count: chats.length })
			delay(500)
			for (const chat of chats) {
				const msg = await fetch_messages(chat) as any
				
				delay(500)
				if ((msg?._data?.type === 'ciphertext' && msg?._data?.subtype === "fanout") && (msg.type !== 'chat' && !msg.body)) {
					msg.error_message = loader("BOT_GET_CHAT_CIPHERTEXT_MESSAGE")
					await this.chat.call('error', msg)
				}

				if (msg?._data?.type === 'ciphertext' && (msg.type !== 'chat' && !msg.body)) {
					msg.error_message = loader("BOT_GET_CHAT_CIPHERTEXT_MESSAGE")
					await this.chat.call('error', msg)
				}
				
				if (msg.body.match(/(pagar|raspar|recargar|gift_card|tarjeta)/gim)) {
					msg.error_message = loader("BOT_GET_CHAT_PAYMENT_MESSAGE")
					await this.chat.call('error', msg)
				}
				else {
					await this.chat.call(msg.body, msg)
				}

				logger.info({ 
					info: 'get_chats', 
					diff: distanceIntoDates(chat.lastMessage.timestamp * 1000, Date.now(), 'seconds'),
					msg })

				cache.save({
					username: msg.from,
					last_message: undefined,
					last_timestamp: undefined
				})
				
				
			}

		}

		delay(10000)
		this.isReading = false
	}
}

