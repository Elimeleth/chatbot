export type Bank = {
    name: string,
    code: string,
    status: typeof STATUS_BANK_AVAILABLE | typeof STATUS_BANK_UNAVAILABLE
    mini: string,
    owner_name: string,
    number: string,
    rif: string,
    hasPm: boolean
  }

export const STATUS_BANK_AVAILABLE = 'Disponible'
export const STATUS_BANK_UNAVAILABLE = 'No disponible'