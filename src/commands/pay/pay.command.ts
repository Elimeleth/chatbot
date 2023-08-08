import { httpClient } from "../../services/http";
import { APIResponse } from "../../shared/interfaces/api/fetch-response";
import { Callback, Command } from "../../shared/interfaces/chat";
import { BaseCommand } from "../../shared/interfaces/commands";

export class Pay extends BaseCommand {
    constructor (name: string, private command: Command) {
        super(name)
    }

    async call(): Promise<APIResponse> {
        return await httpClient({
            url: this.command.action?.endpoint_url,
            data: this.command.action?.data,
            method: this.command.action?.method,
        })
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