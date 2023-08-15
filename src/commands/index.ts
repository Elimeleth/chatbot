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
import { _welcome } from "./interact/welcome.command"
import { _tutorial } from "./interact/tutorial.command"
import { _extra_tutorial } from "./interact/extra-commands.command"
import { _services } from "./interact/services.command"
import { _banks } from "./banks/banks.command"
import { _socios, socios_pipe } from "./socios/socios.command"
import { _activate_socios, activate_socios_pipe } from "./socios/socios-activate.command"
import { _referred, referred_pipe } from "./interact/referred.command"
import { _afiliate, afiliate_pipe } from "./afiliate/afiliate.command"
import { _activate_afiliate, activate_afiliate_pipe } from "./afiliate/activate.command"
import { _support } from "./support/support.command"

export const support = { command: _support }
export const afiliate = { command: _afiliate, cb: afiliate_pipe }
export const activate_afiliate = { command: _activate_afiliate, cb: activate_afiliate_pipe }
export const welcome = { command: _welcome }
export const commands = { command: _tutorial }
export const extra_commands = { command: _extra_tutorial }
export const referred = { command: _referred, cb: referred_pipe }
export const services = { command: _services }
export const banks = { command: _banks }
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
