import { balance } from "./commands";
import { Balance } from "./commands/balance/balance.command";
import { ChatFactory } from "./lib";
import { WhatsAppWebService } from "./lib/whatsappWebJs";
import { EVENTS } from "./lib/whatsappWebJs/triggers";

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
    const service = new WhatsAppWebService('Biyuyo Bot').daemon()
    service.attachEvents(EVENTS)
    
    // * ================================================================
    const chat = new ChatFactory(service.bot_name, service)
    chat.addCommand(balance.command).useFunction(balance.cb)
    // * ================================================================
    
    
    
    service.pipe(chat)
    chat.listen()
}

mainLoop()