import { loader } from "../../helpers/loader";
import { PATH_BANKS } from "../../shared/constants/enviroments";
import { BANK_REACTION, LEARN_REACTION } from "../../shared/constants/reactions";
import { Bank, STATUS_BANK_AVAILABLE } from "../../shared/interfaces/api/banks-json";
import { APIResponse, STATUS_RESPONSE_SUCCES } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

class Banks extends BaseCommand {
    private command: Command = {
        key: "bancos",
        intents: ['bancos', 'cuentas'],
        action: {
            url: "",
            method: "",
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }

    call = async () => await new Promise((resolve, _) => {
        const banks = loader(null, PATH_BANKS) as Bank[]
        const deposit_min_amount = loader("DEPOSIT_MIN_AMOUTN")
        let message = loader("HEADER_BANKS") + '\n\n'
        for (const bank of banks) {
            if (bank.status === STATUS_BANK_AVAILABLE) {
                let name = bank.name
                let owner_name = bank.owner_name ? '\n'+bank.owner_name : ''
                let number = bank.number ? '\n'+bank.number : ''
                let rif = bank.rif ? '\n'+bank.rif : ''
                message += `${name}${owner_name}${number}${rif}\n\n`;
            }
        }
        message += deposit_min_amount
        return resolve({
            message,
            status_response: STATUS_RESPONSE_SUCCES,
            react: BANK_REACTION
        })

    }) as APIResponse
    
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

export const _banks = new Banks('bancos')
export const _banks_pipe = _banks.pipe(async (_, command) => {
    // @ts-ignore
    await command.deliveryMessage()
})