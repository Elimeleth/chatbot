import { loader } from "../../helpers/loader";
import { APIResponse, STATUS_RESPONSE_FAILED, STATUS_RESPONSE_SUCCES } from "../../shared/interfaces/api/fetch-response";
import { Amount } from "../../shared/interfaces/api/services-amounts";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Welcome extends BaseCommand {
    private command: Command = {
        key: "hola",
        intents: ['buenas', 'buen', 'dia', 'epa', 'ejeee', 'eje', 'hey', 'hola', 'informacion', 'estas', 'hello', 'hi', 'saludo', 'salu2', 'buenos'],
        action: {
            url: "",
            method: "",
        },
        invalid_data: [],
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await new Promise((resolve, _) => {
        return resolve({
            message: loader("BIENVENIDA"),
            status_response: STATUS_RESPONSE_SUCCES
        })
    }) as APIResponse
    
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

export const _welcome = new Welcome('hola')
export const _welcome_pipe = _welcome.pipe(async (_, command) => {
    // @ts-ignore
    await command.deliveryMessage()
})