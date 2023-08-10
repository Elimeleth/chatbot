import { build_form } from "../../helpers/buildForm";
import { loader } from "../../helpers/loader";
import { assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { URL_SALDO } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { APIResponse, STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Balance extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['mi_saldo', 'consultar_saldo', 'consultar', 'bs', 'saldo', 'balance', 'dinero'],
        action: {
            url: URL_SALDO,
            method: "GET"
        },
        call: () => new Promise((resolve, _) => resolve(null))
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

export const _balance = new Balance('saldo')
export const balance_pipe = _balance.pipe(async (msg, command) => {
    if (!msg || !command) return false

    // * PARAMETROS A PARSEAR
    // * SERVICE CODE
    // * CONTRACT NUMBER
    // * GIFT CODE
    if (msg.extra.length) {
    
        // service_code: msg.extra.find(param => param.match(EXPRESSION_PATTERN.SERVICE_CODE)),
        // contract_number: msg.extra.find(param => param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT)),
        // gift_code: msg.extra.find(param => param.match(EXPRESSION_PATTERN.GIFT_CODE))
        
        command.form = build_form(
            command.form || {},
            [
                {
                    name: 'service_code',
                    condition: param => !!(param.match(EXPRESSION_PATTERN.SERVICE_CODE))
                },
                {
                    name: 'contract_number',
                    condition: param => !!(param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT))
                },
                {
                    name: 'gift_code',
                    condition: param => !!(param.match(EXPRESSION_PATTERN.GIFT_CODE))
                },
                
            ],
            msg.extra
        )
    }

    try {
        assertKeysNotNullOrUndefined(command.form, ['service_code', 'gift_code'], true)
        // @ts-ignore
        command.action.url += msg.phone
        command.call = _balance.call
    }catch (e: any) { 
        console.log({ message_error: e.message})
        command.call = async () => await new Promise((resolve) => resolve({
            message: loader("CONSULT"),
            status_response: STATUS_RESPONSE_FAILED
        }))
    }
})
    