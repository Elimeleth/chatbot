import { APIResponse } from "../api/fetch-response";
import { Callback, Command } from "../chat";
export abstract class BaseCommand {
    private name: string;
    private description!: string|null;

    constructor (name: string) {
        this.name = name;
    }

    get _name (): string { return this.name; }
    get _description (): string { return this.description as string; }

    set _description (description: string) { this.description = description; }

    abstract pipe<T>(cb: Callback<T>): any
    abstract build (): Command
    abstract call: () => Promise<APIResponse|null>
}