import { config } from "dotenv";
config()

export const URL_SALDO = `${process.env.URI}${process.env.ACCOUNT}`;