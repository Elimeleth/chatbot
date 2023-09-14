import { loader } from "../../helpers/loader";
import { httpClient } from "../../services/http";
import { URL_DEPOSITAR } from "../../shared/constants/enviroments";
import { STATUS_RESPONSE_FAILED } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";
import { localDB } from "../../services/localDB";

class DepositRegister extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['transferencia', 'pago movil', 'pm', 'registrar deposito', 'pagomovil'],
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

export const _depositRegister = new DepositRegister('registrar deposito')
export const deposit_register_pipe = _depositRegister.pipe(async (msg, command) => {
    const deposit = await localDB.findOne(msg.phone)

    if (!deposit) command.call = async () => await new Promise((resolve, _) => {
        resolve({
            message: loader("DEPOSITNOTPENDING"),
            status_response: STATUS_RESPONSE_FAILED
        })
    })
    else {
        command.form = deposit.payload
        command.form.type = msg.body.startsWith('transferencia') ? 'TRANSFER' : 'PM'

        command.call = _depositRegister.call
        
    }
    
    // @ts-ignore
    await command.deliveryMessage(loader("WAIT_DEPOSIT"))


})