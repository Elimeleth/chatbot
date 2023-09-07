import { loader } from "../../helpers/loader";
import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { ACTIVATE_SOCIOS } from "../../shared/constants/api";
import { URL_SOCIOS } from "../../shared/constants/enviroments";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

export class SociosActivate extends BaseCommand {
    private command: Command = {
        key: "activar socios",
        intents: ['activar socios','activar socio', 'activar biyuyo socio', 'activar biyuyo socios', 'activar sociedad', 'activar plus', 'activar membresia', 'activar biyuyo'],
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
export const _activate_socios = new SociosActivate('activar socios');
export const activate_socios_pipe = _activate_socios.pipe(async (msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone, type: ACTIVATE_SOCIOS }
    command.action.url += objectToString(command.form)
    command.call = _activate_socios.call
    // @ts-ignore
    await command.deliveryMessage(loader("WAIT_CONSULT_ACTIVATE_SOCIOS"))
})