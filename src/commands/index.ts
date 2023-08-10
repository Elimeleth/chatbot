import { _balance, balance_pipe } from "./balance/balance.command"
import { _deposit, deposit_capture, deposit_pipe } from "./deposit/deposit.command"

export const balance = { command: _balance, cb: balance_pipe, capture: null }
export const deposit = { command: _deposit, cb: deposit_pipe, capture: deposit_capture }