import { loader } from "../../../helpers/loader";
import { formData, sendPrevieWithXClient } from "../../../helpers/util";
import { serviceWhatsApp } from "../../../lib/whatsappWebJs";
import { PATH_BANKS, PATH_CONFIGURATIONS, PATH_FILE_SERVICES_AMOUNTS, URL_DEPOSIT_EVENT, URL_MENSAJE_EVENT } from "../../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../../shared/constants/patterns";
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

        serviceWhatsApp.send(`${phone}@c.us`, message, {});
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

export const event_message = async (msgs: {
    phone: string[],
    message: string,
    scheduled_notifications_id?: string | number
    link?: boolean,
    type?: string
}): Promise<void> => {
    try {
        let {
            phone,
            scheduled_notifications_id,
            message,
            link,
            type
        } = msgs;

        const match_attention_vcard = !!message.match(new RegExp(`Escríbenos al siguiente contacto`, 'gim'))
        const match_url_finded = !!message.match(EXPRESSION_PATTERN.LINK_PREVIEW_VIDEOS)

        phone = Array.isArray(phone) ? phone : [phone] // * EVALUAMOS QUE SEA ARRAY
        phone = phone.filter(p => p.length > 5)
        const linkPreview = link || true; //* EVALUACION DE LINK PREVIEW EN ENLACES EXTERNOS

        logger.info({ info: 'message_event', msgs });

        for (const p of phone) {
            try {
                if (match_url_finded && !match_attention_vcard && Boolean(Number(loader("USE_XCLIENT_TO_PREVIEW", PATH_CONFIGURATIONS)))) {
                    const preview = await sendPrevieWithXClient(message, p)

                    if (!preview || !preview.message || !preview?.message?.match(/Evento emitido/gim)) {
                        throw new Error("not preview send")
                    }
                } else {
                    await serviceWhatsApp.send(`${p}@c.us`, message, { linkPreview });
                }
            } catch (_) {
                await serviceWhatsApp.send(`${p}@c.us`, message, { linkPreview });
            }

            if (scheduled_notifications_id) {
                const { form: formdata } = formData({ scheduled_notifications_id, type });

                await httpClient({
                    url: URL_MENSAJE_EVENT, 
                    method: 'PUT',
                    data: formdata
                })
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
    logger.info({
        info: 'ticket_file_created',
        ticket
    })
    throw new Error('Method not implemented')
}

export const event_wppconnect_server = async (healthy: any) => {
    throw new Error('Method not implemented')
}