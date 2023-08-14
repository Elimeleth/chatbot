import z from "zod"
import { APIResponse } from "../api/fetch-response";
import { Client, Message, MessageContent, MessageSendOptions } from "whatsapp-web.js";
import { BaseCommand } from "../commands";
import { AxiosRequestConfig } from "axios";

export const value_return = z.object({
    quantity: z.number().describe('quantities of product').default(0),
    details: z.any().describe('details of product').default({}),
    products: z.array(z.string()).describe('products array').default([]),
    message: z.string().describe('message'),
    claim: z.string().describe('claim').default(''),
    command: z.string().describe('command'),
})

export type Command = {
    key: string; // CLAVE DEL COMANDO
    intents: string[]; // ARRAY DE INTENTS
    user_extra_intent?: string|null;
    default_message?: string|null; // MENSAJE POR DEFECTO
    error_message?: string|undefined; // MENSAJE DE ERROR
    MessageSendOptions?: MessageSendOptions; // PARA FUTURAS VALIDACIONES
    fallbacks?: any[];
    call: () => Promise<APIResponse|null>;
    evaluate?: (posible_command: string) => boolean;
    invalid_data?: string[];
    form?: any;
    captureFunction?: any|undefined;
    return_direct?: boolean; // DECIDE SI RETORNA DIRECTO UNA VEZ ENCUENTRE EL COMANDO
    value_return?: Partial<z.infer<typeof value_return>>; // VALIDA EL VALOR QUE RETORNA DE ACUERDO A SU TIPO DE DATO
    action: AxiosRequestConfig // ACCION A REALIZAR
}

export type Action = {
    name: string; // NOMBRE DE LA ACCION
    url: string; // URL A LA CUAL SE LE PEGARA
    method: string; // TIPO DE REQUEST O VERB REQUEST
    data?: any,
    // validate_value_return?: boolean; // VALIDA EL VALOR RETORNADO POR LA REQUEST
    // return_default?: string; // DECIDE SI RETORNA EL VALOR POR DEFECTO
}

export type Callback<T> = (message: Message  & { extra: string[], phone: string, client: Client }, ctx?: Command, err?: Error|unknown) => T;                                                                   


export interface PipeChat {
    call: (input: string, event?: any) => Promise<any>
}

export abstract class BaseChat<T> {
    abstract addCapture<T>(callback: Callback<T> | null): this   
    abstract addCommand<BaseCommand>(command: Command|BaseCommand): this
    abstract useFunction<T>(callback: Callback<T>): this
    abstract addIntentToCommand(key: string, intent: string): this
    abstract addActionToCommand(key: string, action: AxiosRequestConfig): this
    
    abstract call(input: string, event?: any): Promise<any>
}

export abstract class BaseChatService {
    constructor(private name: string) {}

    get bot_name () { return this.name; }
    set bot_name (name: string) { this.name = name;}

    abstract daemon (): this
    abstract listen (): Promise<any>
    abstract attachEvents (events: {
        name: string;
        cb: any
    }[]): void
    abstract cron (schedule: any): void
    abstract status(status: 'seen'|'typing'|'stop', chatId: string): Promise<void>
    abstract send(to: string, message: MessageContent, options?: MessageSendOptions): Promise<any>
}