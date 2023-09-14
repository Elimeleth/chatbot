import { auth_failure } from "./events/auth_failure";
import { authenticated } from "./events/authenticated";
import { incoming_call } from "./events/call";
import { message, message_create } from "./events/message";
import { qr } from "./events/qr";
import { ready } from "./events/ready";
import { change_state } from "./events/state";

export const EVENTS = [
    message,
    message_create,
    incoming_call,
    ready,
    qr,
    change_state,
    auth_failure,
    authenticated
]