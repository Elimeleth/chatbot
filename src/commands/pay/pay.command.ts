import { service_code, services } from "../../helpers/commands";
import { loader } from "../../helpers/loader";
import { build_form, parse_message_output } from "../../helpers/util";
import { assert, assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { buildFormData } from "../../services/form/form-data";
import { httpClient } from "../../services/http";
import { PATH_FILE_SERVICES_AMOUNTS, PATH_FILE_SERVICES_CODES, URL_PAGAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { ERROR_INVALID_DATA_REACTION, WARNING_REACTION } from "../../shared/constants/reactions";
import { APIResponse, STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Amount } from "../../shared/interfaces/api/services-amounts";
import { Service } from "../../shared/interfaces/api/services-json";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Pay extends BaseCommand {
    private command: Command = {
        key: "pagar",
        intents: ['pagar', 'recargar'],
        action: {
            url: URL_PAGAR,
            method: "POST",
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
        if (service && services.some(code => code.name === service.toUpperCase())) {
            msg.extra = msg.extra.filter(e => !service.split(' ').includes(e))
            return services.find(code => code.name === service.toUpperCase())?.service_code as string
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
            service = service_code((code: Service) => code.name === command.form.service_code || code.service_code === command.form.service_code)
        } else if (command.form.contract_number && !!(command.form.contract_number.match(EXPRESSION_PATTERN.NUMBER_PHONE))) {
            service = service_code((code: Service) => !!(
                code.recharge &&
                command.form.contract_number.match(new RegExp(code.code, 'gim'))
            ))
        }
        command.form.service_code = service?.service_code


        assert(command.form.service_code && !(!command.form.contract_number && !service?.pin), loader("BOT_ERROR_SERVICE"))
        assert(command.form.service_code && command.form.amount)
        assert(command.form.contract_number && !service?.recharge && !(command.form.contract_number.match(EXPRESSION_PATTERN.NUMBER_PHONE)), loader("BOT_ERROR_PAYMENT_NUMBER"))

        command.invalid_data = extra.filter(e => msg.extra.includes(e))
        assert(!command.invalid_data.length, loader("INVALID_DATA") + ` *${command.invalid_data.join(',')}*`)

        command.action.data = buildFormData(command.form)
        command.call = _pay.call

    } catch (e: any) {
        const message = parse_message_output(e.message, [{ key: '[CONTRACT_NUMBER]', value: `*${command.form?.contract_number}*`}]).replace(/BOT:/gim, '').trim()
        command.call = async () => await new Promise((resolve) => resolve({
            message,
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))
        command.invalid_data = [];
        command.action.data = null
    }
})

export const pay_capture = _pay.pipe((_, command) => {
    if (!command) return false
    const amounts = loader(null, PATH_FILE_SERVICES_AMOUNTS) as Amount[]
    const amount_list = amounts.find(amount => amount.code === command.form.service_code) as Amount
    const service = service_code((code: Service) => code.service_code === command.form.service_code) as Service

    try {
        if (service.validate_amount && amount_list) {

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
                message,
                status_response: STATUS_RESPONSE_FAILED,
                react: ERROR_INVALID_DATA_REACTION
            })
        })
    }
})