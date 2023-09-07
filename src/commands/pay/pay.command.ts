import { service_code, services } from "../../helpers/commands";
import { loader } from "../../helpers/loader";
import { build_form, parse_message_output } from "../../helpers/util";
import { assert } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { PATH_FILE_SERVICES_AMOUNTS, URL_PAGAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { ERROR_INVALID_DATA_REACTION, WARNING_REACTION } from "../../shared/constants/reactions";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Amount } from "../../shared/interfaces/api/services-amounts";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Pay extends BaseCommand {
    private command: Command = {
        key: "pagar",
        intents: ['pagar', 'raspar', 'recargar'],
        action: {
            url: URL_PAGAR,
            method: "POST",
        },
        evaluate: (posible_command) => {
            if (service_code(code => !!(posible_command.match(new RegExp(code.code, 'gm')))))
                return true
            return false
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
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

export const _pay = new Pay('pagar')
export const pay_pipe = _pay.pipe(async (msg, command) => {
    if (!msg || !command) return false
    if ((msg && !msg.extra.length)) {
        command.call = async () => {
            return {
                message: loader("HOW_PAYMENT"),
                status_response: STATUS_RESPONSE_FAILED
            }
        }

        return null;
    }
    command.form = { phone: msg.phone }

    const services_codes = (values: string[]) => {
        let service = values.join(' ').match(EXPRESSION_PATTERN.SERVICE_CODE)?.toString() as string
        service = service ? service.trim() : service
        if (service && services.some(code => code.names.includes(service.toUpperCase()))) {
            msg.extra = msg.extra.filter(e => !service.split(' ').includes(e))
            return services.find(code => code.names.includes(service.toUpperCase()))?.service_code as string
        }

        return ''
    }

    const { extra, form } = build_form(
        command.form || {},
        [
            {
                name: 'service_code',
                condition_return_value: services_codes,
                condition: param => !!(param.match(EXPRESSION_PATTERN.SERVICE_CODE)),
            },
            {
                name: 'contract_number',
                condition: (param) => !!(param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT) && param.length >= 4)
            },
            {
                name: 'gif_code',
                condition: (param) => !!(param.match(EXPRESSION_PATTERN.GIFT_CODE))
            },
            {
                name: 'amount',
                condition: (param) => !!(param.match(EXPRESSION_PATTERN.SERVICE_AMOUNT))
            },

        ],
        msg.extra
    )
    command.form = form
    try {
        let service: Service | null = null

        if (command.form.service_code) {
            service = service_code((code: Service) => code.names.includes(command.form.service_code) || code.service_code === command.form.service_code)
        } else if (command.form.contract_number && !!(command.form.contract_number.match(EXPRESSION_PATTERN.NUMBER_PHONE))) {
            service = service_code((code: Service) => !!(
                code.recharge &&
                command.form.contract_number.match(new RegExp(code.code, 'gim'))
            ))
        }
        
        command.form.service_code = service?.service_code
        console.log({
            command,
            form: command.form
        })
        assert(command.captureCommand === 'raspar' && command.form.gif_code, loader("HOW_SCRAPE"))
        assert(command.form.service_code && !(!command.form.contract_number && !service?.pin), loader("BOT_ERROR_SERVICE"))
        // assert(command.form.service_code && !!(!command.form.amount && !service?.pin), loader("HOW_PAYMENT"))
        assert(command.form.contract_number || !!(service?.recharge && !command.form.contract_number.match(EXPRESSION_PATTERN.NUMBER_PHONE)), loader("BOT_ERROR_PAYMENT_NUMBER"))

        command.invalid_data = extra.filter(e => msg.extra.includes(e))

        const parse_message = command.form.gif_code ? loader("CONFIRMATION_PAYMENT_WITH_GIFTCARD") : loader("CONFIRMATION_PAYMENT")

        let message = parse_message_output(parse_message, [
            {
                key: '[SERVICE]',
                value: `${service?.name}`
            }, {
                key: '[AMOUNT]',
                value: `${command.form.amount || 'el *monto mínimo* del servicio'}`
            }, {
                key: '[CONTRACT_NUMBER]',
                value: String(command.form.contract_number)
            }, {
                key: '[GIFTCARD]',
                value: String(command.form.gif_code)
            }
        ]).replace(/BOT:/gim, '').trim()
        
        command.call = _pay.call
        // @ts-ignore
        await command.deliveryMessage(message)
        command.error_message = ''
    } catch (e: any) {
        const message = parse_message_output(e.message, [{ key: '[CONTRACT_NUMBER]', value: `*${command.form?.contract_number}*`}]).replace(/BOT:/gim, '').trim()
        command.call = async () => await new Promise((resolve) => resolve({
            message,
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))

        command.error_message = message
        // @ts-ignore
        await command.deliveryMessage()
    }
})

export const pay_capture = _pay.pipe(async (_, command) => {
    if (!command) return false
    
    const amounts = loader(null, PATH_FILE_SERVICES_AMOUNTS) as Amount[]
    const amount_list = amounts.find(amount => amount.code === command.form.service_code) as Amount
    const service = service_code((code: Service) => code.service_code === command.form.service_code) as Service

    try {
        assert(!command.error_message, command.error_message)
        if (service.validate_amount && amount_list && command.form.amount) {

            const { max, min, multiple } = amount_list.amounts
            const amount_service = command.form.amount.replace(/,/gm, '.')
            
            assert((Number(amount_service) > Number(min)), loader("BOT_ERROR_PAYMENT_MIN_AMOUNT"))
            assert((Number(amount_service) < Number(max)), loader("BOT_ERROR_PAYMENT_MAX_AMOUNT"))
            assert((Number(amount_service) % Number(multiple) === 0), loader("BOT_ERROR_PAYMENT_MULTIPLE_AMOUNT"))
        }
    } catch (error: any) {
        let message = parse_message_output(error.message, [
            {
                key: '[SERVICE]',
                value: `*${amount_list?.name}*`
            }, {
                key: '[MIN]',
                value: String(amount_list?.amounts.min)
            }, {
                key: '[MULTIPLE]',
                value: String(amount_list?.amounts.multiple)
            }, {
                key: '[MAX]',
                value: String(amount_list?.amounts.max)
            }
        ]).replace(/BOT:/gim, '').trim()

        command.call = async () => await new Promise((resolve, _) => {
            resolve({
                message: command.error_message || message,
                status_response: STATUS_RESPONSE_FAILED,
                react: ERROR_INVALID_DATA_REACTION
            })
        })
        // @ts-ignore
        await command.deliveryMessage()
    }
})