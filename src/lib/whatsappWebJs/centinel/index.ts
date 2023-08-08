import { Chat, Client, Message } from "whatsapp-web.js";
import { distanceIntoDates, _isToday } from "../../../helpers/date";
// import { user_cache } from "./user_cache";

/**
 * 
 * @param {*} params
* @param {*} listOfOptions
 * BUSQUEDA CONSTANTE DE CHATS PENDIENTES AL HABER INSIDENCIA EN ESTADOS DEL BOT 
 */
export const unreads = async (client: Client) => {
	const chats = (await client.getChats()).filter(filterChat)
};

const filterChat = (chat: Chat): boolean => {
	let evaluate_difference = 10

	// try {
	// 	const diff = validaFileExist(LOGS.LOGS_CHATS_DIFF, undefined, undefined)
	// 	evaluate_difference = diff?.diff || evaluate_difference
	// } catch (_) { }

	return (
		_isToday(chat.timestamp * 1000)
		&& !chat.isGroup
		&& !chat.id.user.includes('status')
		&& !chat.lastMessage.fromMe
		&& ['chat', 'ciphertext'].includes(chat.lastMessage.type)
		&& distanceIntoDates(chat.lastMessage.timestamp * 1000, Date.now(), 'seconds') > Number(evaluate_difference)
	) as boolean
}