import { Message } from "whatsapp-web.js";
import { build_form } from "../../helpers/buildForm";
import { loader } from "../../helpers/loader";
import { assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { buildFormData } from "../../services/form/form-data";
import { httpClient } from "../../services/http";
import { PATH_BANKS, URL_DEPOSITAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Bank, STATUS_BANK_AVAILABLE } from "../../shared/interfaces/api/banks-json";
import { APIResponse, STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Deposit extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['depositar'],
        action: {
            url: URL_DEPOSITAR,
            method: "POST"
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

export const _deposit = new Deposit('depositar')
export const deposit_pipe = _deposit.pipe(async (msg, command) => {
    if (!msg || !command) return false

    if ((msg && !msg.extra.length)) {
        command.call = async () => {
            return {
                message: loader("HOW_DEPOSIT"),
                status_response: STATUS_RESPONSE_FAILED
            }
        }

        return null;
    }
    command.form = { phone: msg.phone }
    const banks = loader(null, PATH_BANKS) as Bank[]
    
    const bank_filter = (param: string, idx?: number) => !!(param.match(EXPRESSION_PATTERN.SERVICE_CODE)) && banks.some(
        bank => bank.mini.toLowerCase().replace('pm', '') === param
        && bank.status === STATUS_BANK_AVAILABLE
    )

    const bank_code = (values: string[]) => {
        for (const value of values) {
            if (bank_filter(value)) return banks.filter(bank => bank.mini.toLowerCase().replace('pm', '') === value)[0].code
        }
        return ''
    }

    command.form = build_form(
        command.form || {},
        [
            {
                name: 'bank_account_application',
                condition_return_value: bank_code,
                condition: bank_filter,
            },
            {
                name: 'bank_reference',
                condition: (param, idx) => !!(idx === 1 && param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT) && param.length >= 4)
            },
            {
                name: 'amount',
                condition: (param, idx) => !!(idx === 2 && param.match(EXPRESSION_PATTERN.BANK_AMOUNT))
            },
            
        ],
        msg.extra
    )

    try {
        assertKeysNotNullOrUndefined(command.form, ['bank_account_application', 'bank_reference', 'amount'])
        // @ts-ignore
        command.action.data = buildFormData(command.form)
        command.call = _deposit.call
    }catch (e: any) {
        command.call = async () => {
            return {
                message: loader("HOW_DEPOSIT"),
                status_response: STATUS_RESPONSE_FAILED}
        }
    }
})

export const deposit_capture = _deposit.pipe((_, command) => {
    if (!command) return false
    
    const banks = loader(null, PATH_BANKS) as Bank[]
    const bank = command.form.bank_account_application

    if (banks.find((bnk) => bnk.code === bank)?.hasPm) {
        command.call = async () => await new Promise((resolve, _) => {
            resolve({
                message: loader("TRANSFER_OR_PM"),
                status_response: STATUS_RESPONSE_FAILED
            })
        })
    }else {
        command.call = _deposit.call
    }

})