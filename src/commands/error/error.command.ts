import { loader } from "../../helpers/loader";
import { httpClient } from "../../services/http";
import { LEARN_REACTION } from "../../shared/constants/reactions";
import { APIResponse, STATUS_RESPONSE_FAILED, STATUS_RESPONSE_SUCCES } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class ErrorCommand extends BaseCommand {
    private command: Command = {
        key: "error",
        intents: ['error'],
        action: {
            url: "",
            method: "",
        },
        invalid_data: [],
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await httpClient(this.command.action) as APIResponse
    
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

export const _error = new ErrorCommand('error')
export const error_pipe = _error.pipe(async (msg, command) => {
    command.call = async () => await new Promise((resolve, reject) => {
        return resolve({
            message: msg.error_message as string,
            status_response: STATUS_RESPONSE_FAILED,
            react: '😓'
        })
    })

    // @ts-ignore
    await command.deliveryMessage()
})