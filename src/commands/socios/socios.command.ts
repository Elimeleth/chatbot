import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { ACTIVATE_SOCIOS, INFO_SOCIOS } from "../../shared/constants/api";
import { URL_SOCIOS } from "../../shared/constants/enviroments";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

export class Socios extends BaseCommand {
    private command: Command = {
        key: "socios",
        intents: ['socio +','socio plus','socio', 'socios', 'biyuyo socios', 'biyuyo socio', 'membresia'],
        action: {
            url: URL_SOCIOS,
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
export const _socios = new Socios('socios');
export const socios_pipe = _socios.pipe(async (msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone, type: INFO_SOCIOS }
    command.action.url += objectToString(command.form)
    command.call = _socios.call
    // @ts-ignore
    await command.deliveryMessage()
})