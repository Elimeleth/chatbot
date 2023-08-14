import { service_code } from "../../helpers/commands";
import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_MONTOS_PINES, URL_PUNTOS } from "../../shared/constants/enviroments";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Pins extends BaseCommand {
    private command: Command = {
        key: "pin",
        intents: ['pin'],
        evaluate: (posible_command) => {
            const [command, ...rest] = posible_command.split(' ');
            const command_long = command+rest[0]
            const pin = service_code((code) => (code.name === command_long.toUpperCase() 
            || code.name === command.toUpperCase()) && code.hasConsultAmount) as Service
            
            if (pin) return true

            return false
        },
        action: {
            url: URL_MONTOS_PINES,
            method: "POST",
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

export const _pin = new Pins('pin')
export const pin_pipe = _pin.pipe((msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }
})