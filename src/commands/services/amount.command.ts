import { service_code } from "../../helpers/commands";
import { loader } from "../../helpers/loader";
import { objectToString } from "../../helpers/util";
import { assert } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { URL_MONTOS_PINES } from "../../shared/constants/enviroments";
import { WARNING_REACTION } from "../../shared/constants/reactions";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class ServiceAmount extends BaseCommand {
    private command: Command = {
        key: "montos",
        intents: ['montos'],
        evaluate: (posible_command) => {
            const [command, ...rest] = posible_command.split(' ');
            const command_long = command+rest[0]
            const service = service_code((code) => (code.names.includes(command_long.toUpperCase())
            || code.names.includes(command.toUpperCase())) && code.hasTemplate) as Service
            
            if (service) return true

            return false
        },
        action: {
            url: "",
            method: "",
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

export const _serviceAmount = new ServiceAmount('montos')
export const service_amount_pipe = _serviceAmount.pipe((msg, command) => {
    if (!command) return false
    
    const [svc, ...rest] = msg.body.split(' ')
    const code = service_code(code => 
        code.names.includes(svc.toUpperCase()) || 
        code.names.includes(`${svc} ${rest[0]}`.toUpperCase()))?.service_code as string
        
    try {
        assert(Boolean(code), loader("BOT_ERROR_CONSULT_SERVICE_AMOUNT_NOT_SERVICE_FOUND"))
        command.form = { service_code: code, phone: msg.phone }
        const queries = objectToString(command.form)
        command.action.url += queries
        command.call = _serviceAmount.call
    } catch (e: any) {
        command.call = async () => await new Promise((resolve) => resolve({
            message: e.message.replace(/BOT:/gim, '').trim(),
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))
    }


    command.invalid_data = []
})