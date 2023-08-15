import { loader } from "../../helpers/loader";
import { LEARN_REACTION, SUPPORT_REACTION } from "../../shared/constants/reactions";
import { APIResponse, STATUS_RESPONSE_SUCCES } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Support extends BaseCommand {
    private command: Command = {
        key: "soporte",
        intents: ['soporte', 'ayuda', 'atencion'],
        action: {
            url: "",
            method: "",
        },
        invalid_data: [],
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await new Promise((resolve, _) => {
        return resolve({
            message: loader("SUPPORT"),
            status_response: STATUS_RESPONSE_SUCCES,
            react: SUPPORT_REACTION
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

export const _support = new Support('soporte')