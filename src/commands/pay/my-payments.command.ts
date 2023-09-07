import { loader } from "../../helpers/loader";
import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_PAGOS } from "../../shared/constants/enviroments";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class MyPayments extends BaseCommand {
    private command: Command = {
        key: "mis pagos",
        intents: ['mis pagos', 'mis servicios', 'pagos'],
        action: {
            url: URL_PAGOS,
            method: "GET",
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
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

export const _myPayments = new MyPayments('mis pagos')
export const my_payments_pipe = _myPayments.pipe((msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }

    command.action.url += objectToString(command.form)

    command.call = _myPayments.call
    // @ts-ignore
    await command.deliveryMessage(loader("WAIT_MY_PAYMENTS"))
})