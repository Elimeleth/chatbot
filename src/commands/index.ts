import { _balance, balance_pipe } from "./balance/balance.command"
import { _deposit, deposit_capture, deposit_pipe } from "./deposit/deposit.command"
import { _pay, pay_capture, pay_pipe } from "./pay/pay.command"

export const balance = { command: _balance, cb: balance_pipe, capture: null }
export const deposit = { command: _deposit, cb: deposit_pipe, capture: deposit_capture }
export const pay = { command: _pay, cb: pay_pipe, capture: pay_capture }