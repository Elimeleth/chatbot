import { config } from "dotenv";
config()

export const NODE_ENV = process.env.NODE_ENV
export const EVENT = process.env.NODE_ENV === "production" ? 'production' : 'test'

// *=================================================
export const URL_LOCALDB = process.env.URL_LOCALDB
export const URL_SOCKET = process.env.URL_SOCKET as string
// * ==============================================================
const URL_API = process.env.URI

// [API - GET]
export const URL_SALDO = URL_API+String(process.env.URL_SALDO);
export const URL_SALDO_OPERATOR = URL_API+String(process.env.URL_SALDO_OPERATOR);
export const URL_SOCIOS = URL_API+String(process.env.URL_SOCIOS)
export const URL_PUNTOS = URL_API+String(process.env.URL_PUNTOS)
export const URL_TICKETS = URL_API+String(process.env.URL_TICKETS)
export const URL_PAGOS = URL_API+String(process.env.URL_PAGOS)
export const URL_DEPOSITOS = URL_API+String(process.env.URL_DEPOSITOS)
export const URL_MONTOS_PINES = URL_API+String(process.env.URL_MONTOS_PINES)
export const URL_REFERIDO = URL_API+String(process.env.URL_REFERIDO)

// [API - POST]
export const URL_DEPOSITAR = URL_API+String(process.env.URL_DEPOSITAR)
export const URL_PAGAR = URL_API+String(process.env.URL_PAGAR)
export const URL_AFILIAR = URL_API+String(process.env.URL_AFILIAR)
export const URL_ACTIVAR = URL_API+String(process.env.URL_ACTIVAR)
export const URL_PROGRAMAR_PAGO = URL_API+String(process.env.URL_PROGRAMAR_PAGO)
export const URL_TICKET_SOPORTE = URL_API+String(process.env.URL_TICKET_SOPORTE)
export const URL_PROMOCION = URL_API+String(process.env.URL_PROMOCION)
export const URL_ALERTA_TELEGRAM = URL_API+String(process.env.URL_ALERTA_TELEGRAM)

// *=====================================================
// [API EVENTOS WEBSOCKET]
export const URL_DEPOSIT_EVENT = URL_API+String(process.env.URL_DEPOSIT_EVENT)
export const URL_MENSAJE_EVENT = URL_API+String(process.env.URL_MENSAJE_EVENT)
export const URL_NOTICIA_EVENT = URL_API+String(process.env.URL_NOTICIA_EVENT)


// * ====================================================

// [FILES]
export const PATH_CONFIGURATIONS = process.env.FILE_CONFIGURATIONS
export const PATH_USER_HISTORY = process.env.FILE_USER_HISTORY
export const PATH_BANKS = process.env.FILE_BANKS
export const PATH_FILE_SERVICES_CODES = process.env.FILE_SERVICES_CODES
export const PATH_FILE_SERVICES_AMOUNTS = process.env.FILE_SERVICES_AMOUNTS