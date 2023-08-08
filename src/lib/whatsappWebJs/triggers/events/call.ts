import { Call } from "whatsapp-web.js";

export const incoming_call = {
    name: 'incoming_call',
    cb: async (call: Call) => {
        await call.reject();
    }
}