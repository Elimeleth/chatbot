import { service_code, services } from "../../helpers/commands";
import { loader } from "../../helpers/loader";
import { build_form, formData, parse_message_output } from "../../helpers/util";
import { assert, assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { PATH_FILE_SERVICES_AMOUNTS, URL_DEPOSIT_EVENT, URL_PAGAR } from "../../shared/constants/enviroments";
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
    call = async () => {
        const retrieved = await httpClient(this.command.action)
        if (retrieved.id && retrieved.type) {
			const { form: formdataReceive } = formData({
				service_payment_id: retrieved.id,
				type: retrieved.type
			});

			await httpClient({
				url: URL_DEPOSIT_EVENT,
				method: 'POST',
				data: formdataReceive
			});

		}
        return retrieved
    }

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
export const pay_pipe = _pay.pipe(async (msg, command, next) => {

    try {
        if (command.captureCommand === 'pagar' && !msg.extra.length) {
            assert(false, loader("HOW_PAYMENT"))
        } 

        command.form = { phone: msg.phone }

        const services_codes = (values: string[]) => {
            let service = values.join(' ').match(EXPRESSION_PATTERN.SERVICE_CODE)?.toString() as string
            
            service = service ? service.replace(/(,|\.)/gim,'').trim() : service
            if (service && services.some(code => code.names.includes(service.toUpperCase()))) {
                msg.extra = msg.extra.filter(e => !service.split(' ').includes(e))
                return services.find(code => code.names.includes(service.toUpperCase()))?.service_code as string
            }

            return ''
        }

        const contract_number = (values: string[]) => {
            return values.find(v => !!String(v).match(EXPRESSION_PATTERN.NUMBER_CONTRACT) ||
                !!String(v).match(EXPRESSION_PATTERN.NUMBER_PHONE)) || ''
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
                    condition_return_value: contract_number,
                    condition: (param) => !!(String(param).match(EXPRESSION_PATTERN.NUMBER_CONTRACT))
                },
                {
                    name: 'gift_code',
                    condition: (param) => !!(param.match(EXPRESSION_PATTERN.GIFT_CODE))
                },
                {
                    name: 'amount',
                    condition: (param) => !!(param.match(EXPRESSION_PATTERN.SERVICE_AMOUNT)) && param.length <= 6
                },

            ],
            msg.extra
        )
        command.form = form
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

        if (command.captureCommand === 'raspar' && !command.form.gift_code) {
            assert(false, loader("HOW_SCRAPE"))
        }

        
        if (!Boolean(service?.pin) && !command.form.amount) {
            assert(false, loader("HOW_PAYMENT"))
        }

        if (!service?.pin && !command.form.contract_number) {
            assert(false, loader("HOW_PAYMENT"))
        }
        assert(!!Object.keys(command.form).length, loader("HOW_PAYMENT"))
        assert(command.form.service_code && !(!command.form.contract_number && !service?.pin), loader("BOT_ERROR_SERVICE"))
        
        if (command.form.contract_number) command.form.contract_number = command.form.contract_number.replace(/\D/g, '')
        
        msg.invalid_data = extra.filter(e => msg.extra.includes(e))

        command.call = _pay.call
        next()
    } catch (e: any) {
        const message = parse_message_output(e.message, [{ key: '[CONTRACT_NUMBER]', value: `*${command.form?.contract_number}*` }]).replace(/BOT:/gim, '').trim()
        command.call = async () => await new Promise((resolve) => resolve({
            message,
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))

        // @ts-ignore
        await command.deliveryMessage()
    }
})

export const pay_capture = _pay.pipe(async (_, command) => {

    const amounts = loader(null, PATH_FILE_SERVICES_AMOUNTS) as Amount[]
    const amount_list = amounts.find(amount => amount.code === command.form.service_code) as Amount
   
    try {
        const service = service_code((code: Service) => code.service_code === command.form.service_code) as Service

        assert(!!service)
        if (service.validate_amount && amount_list && command.form.amount) {

            const { max, min, multiple } = amount_list.amounts
            const amount_service = command.form.amount.replace(/,/gm, '.')
            
            assert((Number(amount_service) >= Number(min)), loader("BOT_ERROR_PAYMENT_MIN_AMOUNT"))
            assert((Number(amount_service) <= Number(max)), loader("BOT_ERROR_PAYMENT_MAX_AMOUNT"))
            assert((Number(amount_service) % Number(multiple) === 0), loader("BOT_ERROR_PAYMENT_MULTIPLE_AMOUNT"))
        }
        let parse_message = command.form.gift_code ? loader("CONFIRMATION_PAYMENT_WITH_GIFTCARD") : loader("CONFIRMATION_PAYMENT")

        if (service.pin) {
            parse_message = command.form.gift_code ? loader("CONFIRMATION_PAYMENT_WITH_GIFTCARD_WITHOUT_CONTRACT_NUMBER") : loader("CONFIRMATION_PAYMENT_WITHOUT_CONTRACT_NUMBER")
        }
        
        let message = parse_message_output(parse_message, [
            {
                key: '[SERVICE]',
                value: `${service?.name}`
            }, {
                key: '[AMOUNT]',
                value: service.pin 
                && service.especial_amount.includes(Number(command.form.amount))
                 ? `${service.symbol} ${command.form.amount}` 
                 : `${command.form.amount ? `${service.symbol} ${command.form.amount}` : 'el monto mínimo del servicio'}`
            }, {
                key: '[CONTRACT_NUMBER]',
                value: String(command.form.contract_number)
            }, {
                key: '[GIFTCARD]',
                value: String(command.form.gift_code)
            }
        ]).replace(/BOT:/gim, '').trim()
        
        // @ts-ignore
        await command.deliveryMessage(message)
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
                message: message,
                status_response: STATUS_RESPONSE_FAILED,
                react: ERROR_INVALID_DATA_REACTION
            })
        })
        
        // @ts-ignore
        await command.deliveryMessage()
    }
})