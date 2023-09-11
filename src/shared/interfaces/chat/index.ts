import z from "zod"
import { APIResponse } from "../api/fetch-response";
import { Client, Message, MessageContent, MessageSendOptions } from "whatsapp-web.js";
import { AxiosRequestConfig } from "axios";

export type CacheHistory = {
    message_id: string;
    username: string;
    last_message: string;
    last_message_bot: string;
    last_timestamp?: string|number;
    prev_message?: string;
    prev_timestamp?: string|number;
    last_timestamp_bot?: string|number;
    prev_message_bot?: string|null;
    prev_timestamp_bot?: string|number;
    cached?: boolean;
    error_count?: number;
    // history: [string, string][]
}

export const api_response = z.object({
    status_response: z.string(),
    message: z.string().describe('message'),
    react: z.string().describe('reaction message')
})

export type Command = {
    key: string; // CLAVE DEL COMANDO
    intents: string[]; // ARRAY DE INTENTS
    user_extra_intent?: string|null;
    default_message?: string|null; // MENSAJE POR DEFECTO
    MessageSendOptions?: MessageSendOptions & { path_media?: string }; // PARA FUTURAS VALIDACIONES
    fallbacks?: any[];
    call: () => Promise<APIResponse|null>;
    deliveryMessage?: (wait_message: string|undefined) => Promise<void>;
    evaluate?: (posible_command: string) => boolean;
    form?: any;
    captureCommand?: string|null;
    captureFunction?: any|undefined;
    return_direct?: boolean; // DECIDE SI RETORNA DIRECTO UNA VEZ ENCUENTRE EL COMANDO
    api_response?: Partial<z.infer<typeof api_response>>; // VALIDA EL VALOR QUE RETORNA DE ACUERDO A SU TIPO DE DATO
    action: AxiosRequestConfig // ACCION A REALIZAR
}

export type ExtraMessage = { 
    extra: string[], 
    phone: string, 
    client: Client, 
    haveTicketSupport: boolean,
    error_message?: string 
    invalid_data?: string[];
}


export type Callback<T> = (message: Message  & ExtraMessage, ctx: Command, next: () => any) => T;                                                                   


export interface PipeChat {
    call: (input: string, event?: any) => Promise<any>
}

export abstract class BaseChat<T> {
    abstract addCapture<T>(callback: Callback<T> | null): this   
    abstract addCommand<BaseCommand>(command: Command|BaseCommand): this
    abstract useFunction<T>(callback: Callback<T>): this
    abstract addIntentToCommand(key: string, intent: string): this
    abstract addActionToCommand(key: string, action: AxiosRequestConfig): this
    
    abstract call(input: string, event?: any, cb?: (...args: any[]) => Promise<any>): Promise<any>
}

export abstract class BaseChatService {
    constructor(private name: string) {}

    get bot_name () { return this.name; }
    set bot_name (name: string) { this.name = name;}

    abstract get version (): Promise<string>
    abstract get _client (): any
    abstract get _isConnected (): boolean

    abstract daemon (): this
    abstract listen (): Promise<any>
    abstract attachEvents (events: {
        name: string;
        cb: any
    }[]): void
    abstract sendContact (...args: any[]): void
    abstract sendMedia (...args: any[]): void
    abstract cron (schedule: any, cb: any): void
    abstract status(status: 'seen'|'typing'|'stop', chatId: string): Promise<void>
    abstract send(to: string, message: MessageContent, options?: MessageSendOptions): Promise<any>
}