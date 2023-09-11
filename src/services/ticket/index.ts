import { loader } from "../../helpers/loader"
import { formData } from "../../helpers/util"
import { PATH_CONFIGURATIONS, PATH_TICKET_SUPPORT, URL_GNFILES, URL_TICKET_SOPORTE } from "../../shared/constants/enviroments"
import { httpClient } from "../http"
import { logger } from "../logs/winston.log"
import fs from "fs"
type Multimedia = {
    data: string,
    mimetype: string,
    id: string
}
class TicketSupport {

    haveTicket (phone: string) {
        const ticket: { phone: string, status: string}[] = loader(null, PATH_TICKET_SUPPORT) || []

        if (!ticket.length) return false
        return !!(ticket.some(t => t.phone === phone ))
    }

    private async download_file(multimedia: Multimedia) {
        const media_data_response = await httpClient({
            url: URL_GNFILES,
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData({
                base64: `data:${multimedia.mimetype};base64,${multimedia.data}`,
                fileName: String(multimedia.id),
                folderName: loader("FOLDER_NAME_WHATSAPP", PATH_CONFIGURATIONS)
            }).form
        })
        
        if (media_data_response.code && [200, 201].includes(media_data_response.code)) {
            return media_data_response.url
        }

        return null
    }

    async create (form: any, multimedia?: Multimedia|undefined) {
        if (multimedia) form.image_url = await this.download_file(multimedia)
        
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