import { activate_afiliate, activate_points, activate_socios, afiliate, balance, banks, commands, deposit, deposit_register, error_command, extra_commands, my_deposits, my_payments, my_tickets, pay, pin, points, referred, service_amounts, services, socios, support, welcome } from "./commands";
import { ChatFactory } from "./lib";
import { WhatsAppWebService, serviceWhatsApp } from "./lib/whatsappWebJs";
import { EVENTS } from "./lib/whatsappWebJs/triggers";
import { connect_websocket } from "./services/webSocket";

// [x] Crear loop principal
// [x] Agregar comandos
// [x] Agregar fallbacks
// [x] Agregar middleware
// [x] Agregar capture
// [x] Abjuntar eventos en service
// [ ] Agregar intercept
// [ ] Agregar fetch service
// [x] Agregar loader yaml | json
// [ ] Agregar cron
// [x] Agregar pipe en service
// [ ] Agregar evaluator

const mainLoop = async () => {
    serviceWhatsApp.attachEvents(EVENTS)

    // * ================================================================
    const chat = new ChatFactory(serviceWhatsApp.bot_name, serviceWhatsApp)
    chat
        .addCommand(afiliate.command).useFunction(afiliate.cb)
        .addCommand(activate_afiliate.command).useFunction(activate_afiliate.cb)
        
        .addCommand(support.command).useFunction(support.cb)
        .addCommand(welcome.command).useFunction(welcome.cb)
        .addCommand(commands.command).useFunction(commands.cb)
        .addCommand(extra_commands.command).useFunction(extra_commands.cb)
        .addCommand(services.command).useFunction(services.cb)
        .addCommand(banks.command).useFunction(banks.cb)
        
        .addCommand(referred.command).useFunction(referred.cb)
        .addCommand(socios.command).useFunction(socios.cb)
        .addCommand(activate_socios.command).useFunction(activate_socios.cb)
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

        .addCommand(my_tickets.command).useFunction(my_tickets.cb)

        .addCommand(error_command.command).useFunction(error_command.cb)
    // * ================================================================

    serviceWhatsApp.pipe(chat)
    chat.listen()
    await connect_websocket();
}

mainLoop()