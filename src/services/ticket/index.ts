import { loader } from "../../helpers/loader"
import { formData } from "../../helpers/util"
import { PATH_CONFIGURATIONS, PATH_TICKET_SUPPORT, URL_GNFILES, URL_HAS_TICKET_SUPPORT, URL_TICKET_SOPORTE } from "../../shared/constants/enviroments"
import { httpClient } from "../http"
import { logger } from "../logs/winston.log"
import fs from "fs"
import { telegram_channel } from "../telegram"
import { randomBytes, randomInt } from "crypto"
import { TICKET_SUPPORT_OPEN } from "../../shared/constants/api"
type Multimedia = {
    data: string,
    mimetype: string,
    id: string
}
class TicketSupport {

    async haveTicket (phone: string) {
        const hasTicket = await httpClient({
            url: URL_HAS_TICKET_SUPPORT+phone,
        })

        return !!(hasTicket.message === TICKET_SUPPORT_OPEN)
    }

    private async push_file(multimedia: Multimedia) {
        const media = await httpClient({
            url: URL_GNFILES,
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData({
                base64: `data:${multimedia.mimetype};base64,${multimedia.data}`,
                fileName: String(multimedia.id),
                folderName: loader("FOLDER_NAME_WHATSAPP", PATH_CONFIGURATIONS)
            })
        })
        
        if (media.code && [200, 201].includes(media.code)) {
            return media.url
        }

        return null
    }

    async create (form: any, multimedia?: Multimedia|undefined) {
        if (multimedia) form.image_url = await this.push_file(multimedia)
        
        await telegram_channel.manage_topic(form.phone)
        await telegram_channel.send({
            message: form.message,
            topic: form.phone,
            type: form.image_url ? form.image_url.match(/extension=(ogg|opus|mp3)/gim) ? 'audio' : 'image' : 'text',
            content: {
                url: form.image_url,
                filename: String(randomInt(10))
            }
        })

        const ticket = await httpClient({
            url: URL_TICKET_SOPORTE,
            method: 'POST',
            data: formData(form)
        })

        logger.info({
            info: 'ticket_created', ticket
        })
        this.log(form.phone)
        
        return ticket
    }

    private log (phone: string) {
        let tickets = loader(null, PATH_TICKET_SUPPORT) || []
                
        if (tickets.length) {
            if (!tickets.some((t: any) => t.phone.includes(phone))) {
                fs.writeFileSync(PATH_TICKET_SUPPORT as string, JSON.stringify(tickets), {
                    encoding: 'utf-8',
                    flag: "w",
                    mode: 0o666,
                })
            }
        }else {
            fs.writeFileSync(PATH_TICKET_SUPPORT as string, JSON.stringify([{ phone, status: 'open' }]), {
                encoding: 'utf-8',
                flag: "w",
                mode: 0o666,
            })
        }

        
    }
}

export const create_ticket_support = new TicketSupport();