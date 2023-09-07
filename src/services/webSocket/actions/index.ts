import { event_amounts, event_banks, event_deposit, event_group, event_groups, event_notice, event_ticket, event_tracking, event_wppconnect_server } from "./actions"

const ACTIONS: any = {
    'new_notice': (data: any) => event_notice(data),
    'new_deposit': (data: any) => event_deposit(data),
    'new_banks': (data: any) => event_banks(data),
    'new_message': (data: any) => event_group(data),
    'new_message_group': (data: any) => event_tracking(data),
    'new_track': (data: any) => event_tracking(data),
    'new_amounts': (data: any) => event_amounts(data),
    'new_groups': (data: any) => event_groups(data),
    'new_wppconnect_server': (data: any) => event_wppconnect_server(data),
    'new_ticket': (data: any) => event_ticket(data)
}

export const action = (type: string, data: any) => {
    return ACTIONS[type](data)
}