import { loader } from "../../helpers/loader";
import { LEARN_REACTION } from "../../shared/constants/reactions";
import { APIResponse, STATUS_RESPONSE_SUCCES } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Tutorial extends BaseCommand {
    private command: Command = {
        key: "tutorial",
        intents: ['tutorial', 'comandos', 'trucos'],
        action: {
            url: "",
            method: "",
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await new Promise((resolve, _) => {
        return resolve({
            message: loader("COMMANDS"),
            status_response: STATUS_RESPONSE_SUCCES,
            react: LEARN_REACTION
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

export const _tutorial = new Tutorial('comandos')
export const _tutorial_pipe = _tutorial.pipe(async (_, command) => {
    // @ts-ignore
    await command.deliveryMessage()
})