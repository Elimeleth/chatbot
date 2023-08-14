import { activate_points, balance, deposit, deposit_register, my_deposits, my_payments, pay, pin, points, service_amounts, welcome } from "./commands";
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
    chat
        .addCommand(welcome.command)
        .addCommand(service_amounts.command).useFunction(service_amounts.cb)
        .addCommand(balance.command).useFunction(balance.cb)
        .addCommand(points.command).useFunction(points.cb)
        .addCommand(activate_points.command).useFunction(activate_points.cb)
    
        .addCommand(deposit.command).useFunction(deposit.cb).useFunction(deposit.capture)
        .addCommand(deposit_register.command).useFunction(deposit_register.cb)
        .addCommand(my_deposits.command).useFunction(my_deposits.cb)
        
        .addCommand(pay.command).useFunction(pay.cb).useFunction(pay.capture)
        .addCommand(my_payments.command).useFunction(my_payments.cb)
        .addCommand(pin.command).useFunction(pin.cb)
    // * ================================================================

    service.pipe(chat)
    chat.listen()
}

mainLoop()