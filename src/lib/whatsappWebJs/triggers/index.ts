import { auth_failure } from "./events/auth_failure";
import { authenticated } from "./events/authenticated";
import { incoming_call } from "./events/call";
import { message } from "./events/message";
import { qr } from "./events/qr";
import { ready } from "./events/ready";

export const EVENTS = [
    message,
    incoming_call,
    ready,
    qr,
    auth_failure,
    authenticated
]