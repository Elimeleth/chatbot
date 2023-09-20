import { loader } from "../../../helpers/loader"
import { provider } from "../../../lib/whatsappWebJs"
import { PATH_CONFIGURATIONS } from "../../../shared/constants/enviroments"
import { logger } from "../../logs/winston.log"
import { event_amounts, event_banks, event_deposit, event_group, event_groups, event_message, event_notice, event_ticket, event_tracking, event_wppconnect_server } from "./actions"

const ACTIONS: any = {
    // 'new_notice': (data: any) => event_notice(data),
    'new_deposit': (data: any) => event_deposit(data),
    'new_banks': (data: any) => event_banks(data),
    'new_message': (data: any) => event_message(data),
    'service_payment': (data: any) => event_message(data),
    // 'new_message_group': (data: any) => event_tracking(data),
    // 'new_track': (data: any) => event_tracking(data),
    'new_amounts': (data: any) => event_amounts(data),
    // 'new_groups': (data: any) => event_groups(data),
    // 'new_wppconnect_server': (data: any) => event_wppconnect_server(data),
    'new_ticket': (data: any) => event_ticket(data)
}

export const action = (type: string, data: any) => {
    if (!provider._isConnected || !ACTIONS[type]) return
    try {
        if (typeof data === 'string') data = JSON.parse(data);

        if (!data['session'] || data['session'].toLowerCase() !== loader('SESSION', PATH_CONFIGURATIONS).toLowerCase()) {
            logger.debug({ message: "event not emited", type, data})
            return false;
        }
        return ACTIONS[type](data)
    } catch (error) {
        logger.error({ message: "event not emited", type, data, error})
        return null
    }
}