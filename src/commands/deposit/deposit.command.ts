import { build_form } from "../../helpers/util";
import { loader } from "../../helpers/loader";
import { assert, assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { httpClient } from "../../services/http";
import { PATH_BANKS, URL_DEPOSITAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Bank, STATUS_BANK_AVAILABLE } from "../../shared/interfaces/api/banks-json";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";
import { WARNING_REACTION } from "../../shared/constants/reactions";
import { localDB } from "../../services/localDB";

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

export const _deposit = new Deposit('depositar')
export const deposit_pipe = _deposit.pipe(async (msg, command, next) => {
    try {
        if ((msg && !msg.extra.length)) {
            assert(false, loader("HOW_DEPOSIT"))
        }
        command.form = { phone: msg.phone }
        const banks = loader(null, PATH_BANKS) as Bank[]

        const bank_filter = (param: string, idx?: number) => !!(param.match(EXPRESSION_PATTERN.SERVICE_CODE)) && banks.some(
            bank => bank.mini.toLowerCase().replace('pm', '') === param
            // && bank.status === STATUS_BANK_AVAILABLE
        )

        const bank_code = (values: string[]) => {
            for (const value of values) {
                if (bank_filter(value)) {
                    msg.extra = msg.extra.filter(e => e !== value)
                    return banks.find(bank => bank.mini.toLowerCase().replace('pm', '') === value)?.code as string
                }
            }
            return ''
        }

        const { extra, form } = build_form(
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
        command.form = form

        assertKeysNotNullOrUndefined(command.form, ['bank_account_application', 'bank_reference', 'amount'])
        assert(banks.some(bank => bank.code === command.form.bank_account_application && bank.status === STATUS_BANK_AVAILABLE), loader("BOT_ERROR_BANK_UNAVAILABLE"))

        msg.invalid_data = extra.filter(e => msg.extra.includes(e))

        next()
    } catch (e: any) {
        command.call = async () => await new Promise((resolve) => resolve({
            message: String(e.message).startsWith('BOT:') ? e.message : loader("HOW_DEPOSIT"),
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }))
        // @ts-ignore
        await command.deliveryMessage()

    }
})

export const deposit_capture = _deposit.pipe(async (_, command) => {
    const banks = loader(null, PATH_BANKS) as Bank[]
    const bank = command.form.bank_account_application
    
    if (banks.find((bnk) => bnk.code === bank)?.hasPm) {
        localDB.create({
            username: command.form.phone,
            diff: 0,
            expired_at: 300,
            thread: 0,
            payload: {
                ...command.form
            }
        }).then().catch();
        command.call = async () => await new Promise((resolve, _) => {
            resolve({
                message: loader("TRANSFER_OR_PM"),
                status_response: STATUS_RESPONSE_FAILED
            })
        })
        // @ts-ignore
        await command.deliveryMessage()
    } else {
        command.form.type = 'TRANSFER'
        command.call = _deposit.call
        // @ts-ignore
        await command.deliveryMessage(loader("WAIT_DEPOSIT"))
    }

})