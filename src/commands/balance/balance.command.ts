import { httpClient } from "../../services/http";
import { URL_SALDO } from "../../shared/constants/urls";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

export class Balance extends BaseCommand {
    private command: Command = {
        key: this._name,
        intents: ['mi_saldo', 'consultar_saldo', 'consultar', 'bs', 'saldo', 'balance', 'dinero'],
        action: {
            name: this._name,
            endpoint_url: URL_SALDO,
            method: "GET"
        },
        call: () => new Promise((resolve, _) => resolve(null))
    }

    constructor (name: string) {
        super(name)
    }

    pipe<T>(cb: Callback<T>) {
        return cb
    }

    async call(): Promise<APIResponse> {
        return await httpClient({
            url: this.command.action?.endpoint_url,
            data: this.command.action?.data,
            method: this.command.action?.method,
        })
    }

    build(): Command {
        return {
            ...this.command,
            call: () => this.call()
        }
    }
    

}