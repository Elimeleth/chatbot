import { build_form, objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_ACTIVAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class AfiliateActivate extends BaseCommand {
    private command: Command = {
        key: "activar",
        intents: ['activar', 'activar servicio', 'activar bot', 'activar biyuyo'],
        action: {
            url: URL_ACTIVAR,
            method: "POST",
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

export const _referred = new AfiliateActivate('activar')
export const referred_pipe = _referred.pipe((msg, command) => {
    if (!command) return false

    const { extra, form } = build_form(
        command.form || {},
        [
            {
                name: 'code',
                condition: param => !!(param.match(EXPRESSION_PATTERN.ACTIVE_CODE))
            },
        ],
        msg.extra
    )
    command.form = form
    command.form.phone = msg.phone

    command.invalid_data = extra
    
    command.call = _referred.call
})