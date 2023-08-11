import { build_form } from "../../helpers/util";
import { loader } from "../../helpers/loader";
import { assert, assertKeysNotNullOrUndefined } from "../../lib/assertions";
import { buildFormData } from "../../services/form/form-data";
import { httpClient } from "../../services/http";
import { PATH_BANKS, URL_DEPOSITAR } from "../../shared/constants/enviroments";
import { EXPRESSION_PATTERN } from "../../shared/constants/patterns";
import { Bank, STATUS_BANK_AVAILABLE } from "../../shared/interfaces/api/banks-json";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";
import { WARNING_REACTION } from "../../shared/constants/reactions";
import { localDB } from "../../services/localDB";

class DepositRegister extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['transferencia', 'pago movil', 'pm'],
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

export const _depositRegister = new DepositRegister('registrar deposito')
export const deposit_pipe = _depositRegister.pipe(async (msg, command) => {
    if (!msg || !command) return false
    
    const deposit = await localDB.findOne(msg.phone)

    if (!deposit) command.call = async () => await new Promise((resolve, _) => {
        resolve({
            message: loader("HOW_DEPOSIT"),
            status_response: STATUS_RESPONSE_FAILED
        })
    })

    console.log({deposit})

    command.action.data = buildFormData(command.form)



    try {
        assert(!msg.extra.length, loader("INVALID_DATA") + ` *${msg.extra.join(',')}*`)
    } catch (error) {
        command.invalid_data = [];
    }


})