import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_REFERIDO } from "../../shared/constants/enviroments";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Referred extends BaseCommand {
    private command: Command = {
        key: "referido",
        intents: ['referido', 'mi enlace', 'link', 'enlace'],
        action: {
            url: URL_REFERIDO,
            method: "GET",
        },
        invalid_data: [],
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

export const _referred = new Referred('referido')
export const referred_pipe = _referred.pipe(async (msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }
    command.action.url += objectToString(command.form)
    command.call = _referred.call
    // @ts-ignore
    await command.deliveryMessage()
})