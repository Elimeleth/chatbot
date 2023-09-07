import { loader } from "../../helpers/loader";
import { objectToString } from "../../helpers/util";
import { httpClient } from "../../services/http";
import { URL_DEPOSITOS, URL_PAGOS } from "../../shared/constants/enviroments";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class MyDeposits extends BaseCommand {
    private command: Command = {
        key: "mis depositos",
        intents: ['mis depositos', 'depositos'],
        action: {
            url: URL_DEPOSITOS,
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

export const _myDeposits = new MyDeposits('mis depositos')
export const my_deposits_pipe = _myDeposits.pipe(async (msg, command) => {
    if (!command) return false

    command.form = { phone: msg.phone }

    command.action.url += objectToString(command.form)

    command.call = _myDeposits.call
    // @ts-ignore
    await command.deliveryMessage(loader("WAIT_MY_PAYMENTS"))
    
})