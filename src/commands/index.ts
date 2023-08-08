import { assertKeysNotNullOrUndefined } from "../lib/assertions"
import { EXPRESSION_PATTERN } from "../shared/constants/patterns"
import { Balance } from "./balance/balance.command"
const _balance = new Balance('saldo')

export const balance = {
    command: _balance,
    cb: _balance.pipe((msg, command) => {
        let form: any = {}
        // * PARAMETROS A PARSEAR
        // * SERVICE CODE
        // * CONTRACT NUMBER
        // * GIFT CODE
        form['service_code'] = msg.extra.find(param => param.match(EXPRESSION_PATTERN.SERVICE_CODE))
        form['contract_number'] = msg.extra.find(param => param.match(EXPRESSION_PATTERN.NUMBER_CONTRACT))
        form['gift_code'] = msg.extra.find(param => param.match(EXPRESSION_PATTERN.GIFT_CODE))

        console.log(form, msg.extra)
        assertKeysNotNullOrUndefined(form, ['service_code', 'gift_code'])

        if (command?.action) {
            command.action.endpoint_url += msg.from.split("@")[0]
        }
    })
}