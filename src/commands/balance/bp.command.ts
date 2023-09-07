import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_PUNTOS } from "../../shared/constants/enviroments";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Bp extends BaseCommand {
    private command: Command = {
        key: "bp",
        intents: ['mis puntos', 'puntos', 'bp', 'biyuyo puntos', 'points'],
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

export const _bp = new Bp('biyuyo puntos')
export const bp_pipe = _bp.pipe((msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }
    command.call = _bp.call
    // @ts-ignore
    await command.deliveryMessage(loader("WAIT_POINTS"))
})