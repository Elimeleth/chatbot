import { balance, deposit, pay } from "./commands";
import { ChatFactory } from "./lib";
import { WhatsAppWebService } from "./lib/whatsappWebJs";
import { EVENTS } from "./lib/whatsappWebJs/triggers";
import { logger } from "./services/logs/winston.log";

// [x] Crear loop principal
// [x] Agregar comandos
// [x] Agregar fallbacks
// [x] Agregar middleware
// [x] Agregar capture
// [x] Abjuntar eventos en service
// [ ] Agregar intercept
// [ ] Agregar fetch service
// [ ] Agregar loader yaml | json
// [ ] Agregar cron
// [ ] Agregar pipe en service
// [ ] Agregar evaluator

const mainLoop = async () => {
    try {
        const service = new WhatsAppWebService('Biyuyo Bot').daemon()
        service.attachEvents(EVENTS)

        // * ================================================================
        const chat = new ChatFactory(service.bot_name, service)
        chat
            .addCommand(balance.command).useFunction(balance.cb)
            .addCommand(deposit.command).useFunction(deposit.cb).useFunction(deposit.capture)
            .addCommand(pay.command).useFunction(pay.cb).useFunction(pay.capture)
        // * ================================================================

        service.pipe(chat)
        chat.listen()

    } catch (error) {
        console.log({ error })
    }
}

mainLoop()