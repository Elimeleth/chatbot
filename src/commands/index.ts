import { _balance, balance_pipe } from "./balance/balance.command"
import { _activateBp, activateBp_pipe } from "./balance/bp-activate.command"
import { _bp, bp_pipe } from "./balance/bp.command"
import { _depositRegister, deposit_register_pipe } from "./deposit/deposit-register.command"
import { _deposit, deposit_capture, deposit_pipe } from "./deposit/deposit.command"
import { _myDeposits, my_deposits_pipe } from "./deposit/my-deposits.command"
import { _pay, pay_capture, pay_pipe } from "./pay/pay.command"
import { _pin, pin_pipe } from "./pines/pines.command"
import { _serviceAmount, service_amount_pipe } from "./services/amount.command"
import { _myPayments, my_payments_pipe } from "./pay/my-payments.command"
import { _welcome, _welcome_pipe } from "./interact/welcome.command"
import { _tutorial, _tutorial_pipe } from "./interact/tutorial.command"
import { _extra_tutorial, _extra_tutorial_pipe } from "./interact/extra-commands.command"
import { _services, _services_pipe } from "./interact/services.command"
import { _banks, _banks_pipe } from "./banks/banks.command"
import { _socios, socios_pipe } from "./socios/socios.command"
import { _activate_socios, activate_socios_pipe } from "./socios/socios-activate.command"
import { _referred, referred_pipe } from "./interact/referred.command"
import { _afiliate, afiliate_pipe } from "./afiliate/afiliate.command"
import { _activate_afiliate, activate_afiliate_pipe } from "./afiliate/activate.command"
import { _support, _support_pipe } from "./support/support.command"
import { _error, error_pipe } from "./error/error.command"
import { _myTickets, my_tickets_pipe } from "./ticket/my-tickets.command"

export const support = { command: _support, cb: _support_pipe }
export const afiliate = { command: _afiliate, cb: afiliate_pipe }
export const activate_afiliate = { command: _activate_afiliate, cb: activate_afiliate_pipe }
export const welcome = { command: _welcome, cb: _welcome_pipe }
export const commands = { command: _tutorial, cb: _tutorial_pipe }
export const extra_commands = { command: _extra_tutorial, cb: _extra_tutorial_pipe }
export const referred = { command: _referred, cb: referred_pipe }
export const services = { command: _services, cb: _services_pipe }
export const banks = { command: _banks, cb: _banks_pipe }
export const socios = { command: _socios, cb: socios_pipe }
export const activate_socios = { command: _activate_socios, cb: activate_socios_pipe }
export const service_amounts = { command: _serviceAmount, cb: service_amount_pipe }
export const balance = { command: _balance, cb: balance_pipe, capture: null }
export const points = { command: _bp, cb: bp_pipe }
export const activate_points = { command: _activateBp, cb: activateBp_pipe }
export const deposit = { command: _deposit, cb: deposit_pipe, capture: deposit_capture }
export const deposit_register = { command: _depositRegister, cb: deposit_register_pipe}
export const my_deposits = { command: _myDeposits, cb: my_deposits_pipe }
export const pay = { command: _pay, cb: pay_pipe, capture: pay_capture }
export const my_payments = { command: _myPayments, cb: my_payments_pipe }
export const pin = { command: _pin, cb: pin_pipe }
export const my_tickets = { command: _myTickets, cb: my_tickets_pipe }
export const error_command = { command: _error, cb: error_pipe }
