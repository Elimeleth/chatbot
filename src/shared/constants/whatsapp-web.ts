import { ClientOptions, LocalAuth, NoAuth } from "whatsapp-web.js";
import { PUPPETEER_ARGS_FLAGS } from "./puppeteer";

export const WEB_VERSION = process.env.WEB_VERSION || '2.2315.6'
// RUTA DONDE SE MANEJA EL GUARDADO DE SESIONES WORKERS
// const dataPath: string = './dist/src/.wwebjs_auth';

// BUSCA CREDENCIALES DE SESION Y LA REUTILIZA
const AUTHSTRATEGY: {LocalAuth: LocalAuth, NoAuth: NoAuth} = {
    LocalAuth: new LocalAuth({
        clientId:  process.argv[2] || 'biyuyo',
    }),
    NoAuth: new NoAuth()
};


// CONFIGURACIONES OPCIONALES DE CLIENTE 
export const CLIENT_OPTIONS: ClientOptions = {
    webVersion: WEB_VERSION,
    webVersionCache: {
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${WEB_VERSION}.html`,
        type: "remote",
        strict: true
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 5000,
    authTimeoutMs: 30000,
    authStrategy: AUTHSTRATEGY.LocalAuth,
    puppeteer: {
        headless: true,
        args: [...PUPPETEER_ARGS_FLAGS]
    }
}

export const COMMAND_NOT_ACCEPTABLE: string[] = [
    'AUDIO',
    'VOICE',
    'PTT',
    'IMAGE',
    'VIDEO',
    'DOCUMENT',
    'STICKER',
    'LOCATION',
    'CONTACT_CARD',
    'CONTACT_CARD_MULTI',
    'PRODUCT',
    'UNKNOWN',
    'GROUP_INVITE',
    'LIST'
];

export const EVENTS_NOT_ACCEPTABLE = [
    'LIST_RESPONSE',
    'REVOKED',
    'ORDER',
    'BUTTONS_RESPONSE',
    'BROADCAST_NOTIFICATION',
    'NOTIFICATION',
    'HSM',
    'NATIVE_FLOW',
    'OVERSIZED',
    'REACTION',
    'PROTOCOL',
    'CALL_LOG',
    'CIPHERTEXT',
    'DEBUG',
    'TEMPLATE_BUTTON_REPLY',
    'GP2',
    'GROUP_NOTIFICATION',
    'E2E_NOTIFICATION',
    'NOTIFICATION_TEMPLATE',
    'PAYMENT',
    'INTERACTIVE'
]
