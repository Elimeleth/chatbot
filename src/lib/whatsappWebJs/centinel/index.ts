import { Chat, Client, Message } from "whatsapp-web.js";
import { distanceIntoDates, _isToday } from "../../../helpers/date";
import { loader } from "../../../helpers/loader";
import { PATH_CONFIGURATIONS } from "../../../shared/constants/enviroments";
// import { user_cache } from "./user_cache";
/**
 * 
 * @param {*} params
* @param {*} listOfOptions
 * BUSQUEDA CONSTANTE DE CHATS PENDIENTES AL HABER INSIDENCIA EN ESTADOS DEL BOT 
 */
const unreads = async (client: Client) => {
	const chats = await client.getChats()
	
	if (!chats.length) return []

	return chats.filter(filterChat)
};

const filterChat = (chat: Chat): boolean => {
	const evaluate_difference = loader("GET_CHATS_EVALUATE_DIFF", PATH_CONFIGURATIONS)

	return (
		_isToday(chat.timestamp * 1000)
		&& !chat.isGroup
		&& !chat.id.user.includes('status')
		&& !chat.lastMessage.fromMe
		&& ['chat', 'ciphertext'].includes(chat.lastMessage.type)
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

export class CentinelWhatsAppWeb  {
	schedule = loader("GET_CHATS_CRON_TIME_SECONDS", PATH_CONFIGURATIONS)

	constructor(private client: Client) {}

	async task() {
		const chats = await unreads(this.client)

		for (const chat of chats) {
			const msg = await fetch_messages(chat) as any

			if ((msg?._data?.type === 'ciphertext' && msg?._data?.subtype === "fanout") && (msg.type !== 'chat' && !msg.body)) {}
			if (msg?._data?.type === 'ciphertext' && (msg.type !== 'chat' && !msg.body)) {}
			if (msg.body.match(/(pagar|raspar|recargar|gift_card|tarjeta)/gim)) {}
			else {}
		}
	}
}

