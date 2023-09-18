import { loader } from "../../../helpers/loader";
import { formData } from "../../../helpers/util";
import { provider } from "../../../lib/whatsappWebJs";
import { PATH_BANKS, PATH_CONFIGURATIONS, PATH_FILE_SERVICES_AMOUNTS, PATH_TICKET_SUPPORT, URL_DEPOSIT_EVENT, URL_MENSAJE_EVENT } from "../../../shared/constants/enviroments";
import { httpClient } from "../../http";
import { logger } from "../../logs/winston.log";
import fs from "fs"

export const event_notice = async (notices: {
    phone: string[],
    message: string,
    icon_url: string,
    notice_id?: string | number,
}): Promise<void> => {
    throw new Error('Method not implemented')
};

export const event_deposit = async (deposits: {
    phone: string,
    message: string,
    deposit_id?: string | number,
    type?: string
}): Promise<void> => {
    try {
        const {
            phone,
            message,
            deposit_id,
            type
        } = deposits;

        logger.info({ info: 'deposit_event', deposits });

        provider.send(`${phone}@c.us`, message, {});
        const formdata = formData({ deposit_id, type });


        await httpClient({
            url: URL_DEPOSIT_EVENT,
            method: 'POST',
            data: formdata
        })

        logger.info({
            fromMe: true,
            from: null,
            to: `${phone}@c.us`,
            body: message,
            message_revoke_everyone: false,
            message_revoke_me: false
        });

        logger.info({
            info: 'event_deposit_created',
            deposits
        })
    } catch (error: any) {
        logger.info({ info: 'event_deposit_error', error: error.message });
        logger.error(error.message);
    }
};

export const event_message = async (msgs: any): Promise<void> => {

    // {
    //     phone: string[],
    //     message: string,
    //     scheduled_notifications_id?: string | number
    //     link?: boolean,
    //     type?: string,
    //     service_payment_id: string | number
    // }
    
    try {
       
        let {
            phone,
            scheduled_notifications_id,
            message,
            link,
            type,
            service_payment_id
        } = msgs;

        phone = Array.isArray(phone) ? phone : [phone] // * EVALUAMOS QUE SEA ARRAY
        // phone = phone.filter((p: string) => p.length > 5)
        const linkPreview = link || true; //* EVALUACION DE LINK PREVIEW EN ENLACES EXTERNOS

        logger.info({ info: 'message_event', msgs });

        for (const p of phone) {
            let contact = `${p}@c.us`
            
            if (loader('SUPPORT').match(new RegExp(String(message), 'gim'))) {
                await provider.sendContact(contact, loader("SUPPORT"), loader("SUPPORT_CONTACT", PATH_CONFIGURATIONS))
            }
            else await provider.send(contact, message, { linkPreview });

            if (scheduled_notifications_id) {
                const { form: formdata } = formData({ scheduled_notifications_id, type });

                await httpClient({
                    url: URL_MENSAJE_EVENT, 
                    method: 'PUT',
                    data: formdata
                })
            }

            if (service_payment_id) {
                const { form: formdataReceive } = formData({
                    service_payment_id,
                    type
                });
    
                await httpClient({
                    url: URL_DEPOSIT_EVENT,
                    method: 'POST',
                    data: formdataReceive
                });
            }

            logger.info({
                info: 'event_message_created',
                msgs
            })
        }


    } catch (error: any) {
        logger.info({ info: 'event_message_error', error: error.message });
        logger.error(error.message);
    }
};


export const event_banks = async (banks: any) => {
    logger.info({
        info: 'banks_file_created',
        banks
    })
    try {
        fs.writeFileSync(PATH_BANKS as string, JSON.parse(banks), {
            encoding: 'utf-8',
            flag: "w",
            mode: 0o666,
          })
    } catch (_) { }
};

export const event_group = async (data: {
    from: string
    msg: string
}) => {
    throw new Error('Method not implemented')
}

export const event_tracking = async (tracking: any) => {
    throw new Error('Method not implemented')
}

export const event_amounts = async (amounts: any) => {
    logger.info({
        info: 'amounts_file_created',
        amounts
    })
    try {
        fs.writeFileSync(PATH_FILE_SERVICES_AMOUNTS as string, JSON.parse(amounts), {
            encoding: 'utf-8',
            flag: "w",
            mode: 0o666,
        })
    } catch (_) { }
}
export const event_groups = async (groups: any) => {
    throw new Error('Method not implemented')
}

export const event_ticket = async (ticket: any) => {
    try {
        if (!ticket.phone || !ticket.status) return null
        
        let tickets = loader(null, PATH_TICKET_SUPPORT) || []
        
        if (tickets.length) {
            if (tickets.some((t: any) => t.phone === ticket.phone && ticket.status.match(/close/gim))) {
                tickets = tickets.filter((t: any) => t.phone !== ticket.phone)
            }
        }

        fs.writeFileSync(PATH_TICKET_SUPPORT as string, JSON.stringify(tickets), {
            encoding: 'utf-8',
            flag: "w",
            mode: 0o666,
        })

        logger.info({
            info: 'ticket_file_created',
            ticket
        })
    } catch (_) { }
}

export const event_wppconnect_server = async (healthy: any) => {
    throw new Error('Method not implemented')
}