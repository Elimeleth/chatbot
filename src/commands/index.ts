import { _balance, balance_pipe } from "./balance/balance.command"
import { _activateBp, activateBp_pipe } from "./balance/bp-activate.command"
import { _bp, bp_pipe } from "./balance/bp.command"
import { _depositRegister, deposit_register_pipe } from "./deposit/deposit-register.command"
import { _deposit, deposit_capture, deposit_pipe } from "./deposit/deposit.command"
import { _pay, pay_capture, pay_pipe } from "./pay/pay.command"
import { _pin, pin_pipe } from "./pines/pines.command"

export const balance = { command: _balance, cb: balance_pipe, capture: null }
export const points = { command: _bp, cb: bp_pipe }
export const activate_points = { command: _activateBp, cb: activateBp_pipe }
export const deposit = { command: _deposit, cb: deposit_pipe, capture: deposit_capture }
export const deposit_register = { command: _depositRegister, cb: deposit_register_pipe}
export const pay = { command: _pay, cb: pay_pipe, capture: pay_capture }
export const pin = { command: _pin, cb: pin_pipe }
