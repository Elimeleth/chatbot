import { build_form, findKeyOrFail, objectToString } from "../../helpers/util";
import { loader } from "../../helpers/loader";
import { assert, assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { PATH_FILE_SERVICES_CODES, URL_SALDO, URL_SALDO_OPERATOR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";
import { WARNING_REACTION } from "../../shared/constants/reactions";
import { service_code, services } from "../../helpers/commands";

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

    constructor(name: string) {
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
    command.form = {
        phone: msg.phone
    }

    try {
        if (msg.extra.length) {
            // service_code: msg.extra.find(param => param.match(EXPRESSION_PATTERN.SERVICE_CODE)),
            // contract_number: msg.extra.find(param => param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT)),
            // gift_code: msg.extra.find(param => param.match(EXPRESSION_PATTERN.GIFT_CODE))

            const services_codes = (values: string[]) => {
                for (const value of values) {
                    if (services.some(service => service.names.includes(value.toUpperCase()))) {
                        msg.extra = msg.extra.filter(e => e !== value)
                        return services.find(code => code.names.includes(value.toUpperCase()))?.service_code as string
                    }
                }

                return ''
            }

            const { extra, form } = build_form(
                command.form || {},
                [
                    {
                        name: 'service_code',
                        condition_return_value: services_codes,
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
            command.form = form
            const service = service_code((code) => code.service_code === command.form.service_code) as Service
            assertKeysNotNullOrUndefined(command.form, ['service_code', 'gift_code'], true)
            assert(!command.form.gift_code && findKeyOrFail(command.form, ['service_code', 'contract_number']), loader("BOT_ERROR_NOT_SERVICE_OR_CONTRACT"))
            assert(service.recharge && !command.form.contract_number.match(new RegExp(service.code, 'gim')), loader("BOT_ERROR_MOVIL_NOT_MATCH"))
            assert(command.form.service_code && service.hasConsultFromOperator)

            command.invalid_data = extra.filter(e => msg.extra.includes(e))        
        }
        
        const queries = objectToString(command.form)
        
        command.action.url = queries.includes('service_code')
            ? URL_SALDO_OPERATOR + objectToString(command.form)
            : command.action.url += queries

        command.form = null
        command.call = _balance.call

        // @ts-ignore
        await command.deliveryMessage(loader("WAIT_CONSULT"))
    } catch (e: any) {
        command.call = async () => await new Promise((resolve) => resolve({
            message: String(e.message).startsWith('BOT:') ? e.message.replace(/BOT:/gim, '').trim() : loader("CONSULT"),
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))

        command.action.data = null

        // @ts-ignore
        await command.deliveryMessage()
    }
})
