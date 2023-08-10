import { config } from "dotenv";
config()

export const URL_LOCALDB = process.env.URL_LOCALDB

// * ==============================================================
const URL_API = process.env.URI
export const URL_SALDO = URL_API+String(process.env.URL_SALDO);
export const URL_SALDO_OPERATOR = URL_API+String(process.env.URL_SALDO_OPERATOR);
export const URL_DEPOSITAR = URL_API+String(process.env.URL_DEPOSITAR)

// *=====================================================
export const PATH_BANKS = process.env.FILE_BANKS
export const PATH_FILE_SERVICES_CODES = process.env.FILE_SERVICES_CODES