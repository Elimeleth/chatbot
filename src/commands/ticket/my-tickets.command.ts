import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_DEPOSITOS, URL_PAGOS, URL_TICKETS } from "../../shared/constants/enviroments";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class MyTickets extends BaseCommand {
    private command: Command = {
        key: "mis tickets",
        intents: ['mis tickets', 'tickets', 'sorteo', 'ticket'],
        action: {
            url: URL_TICKETS,
            method: "GET",
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await httpClient(this.command.action)
    
    constructor (name: string) {
        super(name)
    }

    
    pipe<T>(cb: Callback<T>) {
        return cb
    }

    build(): Command {
        return {
            ...this.command,
            call: () => this.call()
        }
    }
}

export const _myTickets = new MyTickets('mis depositos')
export const my_tickets_pipe = _myTickets.pipe((msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }

    command.action.url += objectToString(command.form)

    command.call = _myTickets.call
    // @ts-ignore
    await command.deliveryMessage()
    
})