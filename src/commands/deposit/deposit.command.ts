import { build_form } from "../../helpers/buildForm";
import { loader } from "../../helpers/loader";
import { assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { buildFormData } from "../../services/form/form-data";
import { httpClient } from "../../services/http";
import { PATH_BANKS, URL_DEPOSITAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Bank } from "../../shared/interfaces/api/banks-json";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Deposit extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['depositar'],
        action: {
            name: this._name,
            url: URL_DEPOSITAR,
            method: "POST"
        },
        call: () => new Promise((resolve, _) => resolve(null))

    }
    constructor (name: string) {
        super(name)
    }

    async call(): Promise<APIResponse> {
        // @ts-ignore
        return await httpClient(this.command.action)
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
                status_response: "failed"
            }
        }
    }
    command.form = { phone: msg.phone }
    const banks = loader(null, PATH_BANKS) as Bank[]
    
    const bank_filter = (param: string, idx?: number) => !!(param.match(EXPRESSION_PATTERN.SERVICE_CODE)) && banks.some(
        bank => bank.mini.toLowerCase().replace('pm', '') === param
        && bank.status === 'Disponible'
    )

    command.form = build_form(
        command.form || {},
        [
            {
                name: 'bank_account_application',
                condition: bank_filter
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

    const error = await new Promise((resolve) => {
        assertKeysNotNullOrUndefined(command.form, ['bank_account_application', 'bank_reference', 'amount'])
        // @ts-ignore
        command.action.data = buildFormData(command.form)
        resolve(null)
    }).catch((error) => {
        return {
            message: loader("HOW_DEPOSIT"),
            status_response: "failed"
        }
    }) as Promise<APIResponse>

    if (error) command.call = async () => {
        return error
    }
})