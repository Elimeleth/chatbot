import { config } from "dotenv";
config()

const URL_API = process.env.URI
export const URL_SALDO = URL_API+String(process.env.ACCOUNT);
export const URL_DEPOSITAR = URL_API+String(process.env.DEPOSIT)

// *=====================================================
export const PATH_BANKS = process.env.FILE_BANKS