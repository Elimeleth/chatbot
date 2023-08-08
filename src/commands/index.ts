import { Balance } from "./balance/balance.command"
const _balance = new Balance('saldo')

export const balance = {
    command: _balance,
    cb: _balance.pipe((msg, command) => {
        if (command?.action) {
            command.action.endpoint_url += msg.from.split("@")[0]
        }
    })
}