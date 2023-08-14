import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { ACTIVATE_POINTS } from "../../shared/constants/api";
import { URL_PUNTOS } from "../../shared/constants/enviroments";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class ActivateBp extends BaseCommand {
    private command: Command = {
        key: "activar puntos",
        intents: ['activar puntos', 'activar bp'],
        action: {
            url: URL_PUNTOS,
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

export const _activateBp = new ActivateBp('activar puntos')
export const activateBp_pipe = _activateBp.pipe((msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone, type: ACTIVATE_POINTS }

    command.call = _activateBp.call
})