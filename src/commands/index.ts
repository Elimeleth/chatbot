import { build_form } from "../helpers/buildForm"
import { loader } from "../helpers/loader"
import { assertKeysNotNullOrUndefined } from "../lib/assertions"
import { PATH_BANKS } from "../shared/constants/enviroments"
import { EXPRESSION_PATTERN } from "../shared/constants/patterns"
import { Bank } from "../shared/interfaces/api/banks-json"
import { _balance, balance_pipe } from "./balance/balance.command"
import { _deposit, deposit_capture, deposit_pipe } from "./deposit/deposit.command"

export const balance = { command: _balance, cb: balance_pipe, capture: null }
export const deposit = { command: _deposit, cb: deposit_pipe, capture: deposit_capture }