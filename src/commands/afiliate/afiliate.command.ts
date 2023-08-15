import { build_form } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_AFILIAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class AfiliateActivate extends BaseCommand {
    private command: Command = {
        key: "afiliarme",
        intents: ['afiliar', 'registrarme', 'registrame', 'afiliarme'],
        action: {
            url: URL_AFILIAR,
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
                name: 'reference_code',
                condition: (param, idx) => !!(idx === 0 && param.match(EXPRESSION_PATTERN.REFERENCE_CODE))
            },
        ],
        msg.extra
    )
    command.form = form
    command.form.phone = msg.phone
    try {
        // @ts-ignore
		command.form.name = msg._data.notifyName
	    // @ts-ignore
		? msg._data.notifyName.replace(/[^a-zA-Z]/g, '')
		: null;
	} catch (error: any) {
		command.form.name = null
	}

    if (!command.form.name || command.form.name.length > 6) delete 
    command.form.name;
    command.invalid_data = extra
    
    command.call = _referred.call
})