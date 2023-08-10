import { httpClient } from "../../services/http";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

export class Pay extends BaseCommand {
    private command: Command = {
        key: "pagar",
        intents: [],
        action: {
            url: "",
            method: "GET",
        },
        call: async () => await new Promise((resolve, reject) => resolve(null))
    }
    call = async () => await httpClient(this.command.action)
    
    constructor (name: string) {
        super(name)
    }


    pipe<T>(cb: Callback<T>) {
        throw new Error("Method not implemented.");
    }

    build(): Command {
        return {
            ...this.command,
            call: () => this.call()
        }
    }
    

}