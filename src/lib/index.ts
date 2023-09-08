import { BehaviorSubject } from "rxjs";
import { Action, BaseChat, BaseChatService, Callback, Command, api_response } from "../shared/interfaces/chat";
import { assert, assertArray } from "./assertions";
import { BaseCommand } from "../shared/interfaces/commands";
import { Client, Message } from "whatsapp-web.js";
import { APIResponse, STATUS_RESPONSE_FAILED } from "../shared/interfaces/api/fetch-response";
import { clean } from "../helpers/util";
import { FAST_REACTION, WAITING_REACTION, WARNING_REACTION } from "../shared/constants/reactions";
import { WhatsAppWebService } from "./whatsappWebJs";
import { buildFormData } from "../services/form/form-data";
import { loader } from "../helpers/loader";
import { EXPRESSION_PATTERN } from "../shared/constants/patterns";
import { cache } from "../services/cache/history-cache";
import { PATH_CONFIGURATIONS } from "../shared/constants/enviroments";

export class ChatFactory<T> implements BaseChat<T> {
    private commands: Command[] = [];
    private history = cache
    private ctx$ = new BehaviorSubject<Command | null>(null)

    constructor(private bot_name: string, private service: WhatsAppWebService) { }

    get name() { return this.bot_name; }

    get ctx() {
        return this.ctx$.getValue() as Command
    }

    get client() {
        return this.service._client
    }

    listen() {
        assertArray(this.commands)
        return this.service.listen()
    }


    private set _commands(command: Command) {
        this.commands = this.commands.filter(_command => _command.key !== command.key)
        this.commands = [...this.commands, command]

        this.ctx$.next(command)
    }

    private findKeyOrFail(keyOrIntent: string, return_intent = false) {
        const command_regexp = (intents: string[]) => new RegExp(`${(intents.map(i => i.trim()).join('|'))}`, 'gim')
        const [possible_command, ...rest] = Array.isArray(keyOrIntent) ? keyOrIntent : keyOrIntent.split(' ')
        const command_double = `${possible_command} ${rest[0]}`
        const command_triple = `${possible_command} ${rest[0]} ${rest[1]}`

        const command = this.commands.find(c =>
            (c.evaluate && c.evaluate(keyOrIntent)) ||
            ([command_triple, command_double, possible_command].includes(c.key) ||
                c.intents.some(key => [command_triple, command_double, possible_command].includes(key)))
        )

        if (!command) throw new Error(`Key: (${possible_command}) not found`)

        command.user_extra_intent = keyOrIntent.replace(possible_command, '').trim()

        if (return_intent) {
            return {
                command,
                intent: keyOrIntent.match(command_regexp(command.intents)) ?? null
            }
        }

        return command
    }

    private validateExpression = (expression: 'only-letters' | 'only-numbers' | 'letters-numbers') => {
        const expr = {
            // 'only-letters'|'only-numbers'|'letters-numbers'
            'only-letters': new RegExp('[a-zA-Z]', 'gim'),
            'only-numbers': new RegExp('[0-9]', 'gim'),
            'letters-numbers': new RegExp('[a-zA-Z0-9]', 'gim')
        }

        return expr[expression] ? expr[expression] : expr['only-letters']

    }

    private async searchIntentOrFail(input: string, expression_regexp: 'only-letters' | 'only-numbers' | 'letters-numbers' | undefined = undefined) {
        if (expression_regexp) {
            const expr = this.validateExpression(expression_regexp)
            input = input.replace(expr, '')
        }

        const { command, intent } = this.findKeyOrFail(input, true) as { command: Command, intent: RegExpMatchArray | null }
        this.ctx$.next(command)

        return { command, intent }
    }

    addCapture<T>(callback: Callback<T>) {
        this.ctx.captureFunction = callback

        return this
    }

    useFunction<T>(callback: Callback<T>) {
        this._commands = {
            ...this.ctx, fallbacks: [
                this.ctx.fallbacks ? this.ctx?.fallbacks : [],
                callback
            ].flat()
        }
        return this
    }

    addCommand<BaseCommand>(_command: Command | BaseCommand) {
        const command = _command instanceof BaseCommand ? _command.build() : _command as Command

        const keys = this.commands?.map(command => command.key)

        if (keys.includes(command.key)) throw new Error(`Key: ${command.key} already exists`)

        command.invalid_data = []
        command.form = {}
        command.action.data = {}

        this.commands.push(command);
        this.ctx$.next(command)

        return this
    }

    addIntentToCommand(key: string, intent: string) {
        const command = this.findKeyOrFail(key) as Command

        command.intents.push(intent)
        this._commands = command

        return this
    }

    addDefaultCommandMessage(key: string, default_message: string) {
        const command = this.findKeyOrFail(key) as Command

        command.default_message = default_message
        this._commands = command

        return this
    }

    addActionToCommand(key: string, action: Action) {
        const command = this.findKeyOrFail(key) as Command

        command.action = action
        this._commands = command

        return this
    }

    async call(input: string, event: Message & { extra: string[], phone: string, client: Client, error_message?: string }) {
        if (cache.antispam(event.from, input)) return this.service.send(event.from, loader("BOT_ERROR_CACHE_DUPLICATE"), {
            quotedMessageId: event.id._serialized
        });
        
        this.history.save({
            last_message: input,
            last_timestamp: Date.now(),
            message_id: event.id.id,
            username: event.from
        })

        const { command, intent } = await this.searchIntentOrFail(clean(input)).catch(e => {
            this.supportVcard(event)
            return { command: null, intent: null }
        }) as { command: Command, intent: RegExpMatchArray | null }
        
        if (!command) return
        const extra = intent ? intent[0] : ''
        command.captureCommand = extra

        command.deliveryMessage = async (wait_message: string|undefined) => {
            await this.delivery({ input, command, event, wait_message })
        }

        event.extra = event.body.replace(new RegExp(extra, 'gim'), '').trim().split(' ').filter((word) => Boolean(word))

        event.phone = event.from.split("@")[0]


        command.fallbacks?.map(async fallback => {
            try {
                await fallback(event, command)
            } catch (e: any) {
                await fallback(null, null, new Error(e.message))
            }
        })
    }

    private supportVcard (event: any) {
        this.service.sendContact(event.from, loader("SUPPORT"), loader("SUPPORT_CONTACT", PATH_CONFIGURATIONS), {
            quotedMessageId: event.id._serialized
        })
   }

    private async delivery (args: any) {
        const { command, event, wait_message } = args

        command.MessageSendOptions ||= {}
        command.MessageSendOptions = {
            ...command.MessageSendOptions,
            quotedMessageId: event.id._serialized,
            media: undefined,
            caption: undefined,
        }

        await event.react(WAITING_REACTION)
        if (wait_message) {
            await this.service.send(event.from, wait_message, command.MessageSendOptions)
        }

        let retrieve: APIResponse | null = {
            message: '',
            status_response: STATUS_RESPONSE_FAILED,
            react: WARNING_REACTION
        }
        
        try {

            if (command.action.method !== 'GET' && command.form) {
                command.action.data = buildFormData(command.form)
            }

            // @ts-ignore
            assert(command.invalid_data && !command.invalid_data.length, loader("INVALID_DATA") + ` *${command.invalid_data ? command.invalid_data.join(',') : ''}*`)
            
            retrieve = await command.call() as unknown as APIResponse
            assert(!!(retrieve?.message), loader("BOT_ERROR_FLOW"))
            console.log({ retrieve })
        } catch (e: any) {
            retrieve = {
                message: String(e.message).startsWith('BOT:') ? e.message.replace(/BOT:/gim, '').trim() : loader("BOT_ERROR_FLOW"),
                status_response: STATUS_RESPONSE_FAILED,
                react: WARNING_REACTION
            }

            command.invalid_data = []
        }
        
        command.MessageSendOptions.linkPreview = !!(retrieve.message.match(EXPRESSION_PATTERN.LINK_PREVIEW))

        command.action.data = null
        if (!retrieve.message) return;

        await event.react(retrieve.react || FAST_REACTION)

        this.service.send(event.from, retrieve.message, command.MessageSendOptions)

        this.history.save({
            last_message_bot: retrieve.message as string,
            last_timestamp_bot: Date.now(),
            username: event.from
        })
    }

}