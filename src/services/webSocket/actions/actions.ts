export const event_notice = async (notices: {
    phone: string[],
    message: string,
    icon_url: string,
    notice_id?: string | number,
}): Promise<void> => {
    throw new Error('Method not implemented')
};

export const event_deposit = async (deposits: {
    phone: string,
    message: string,
    deposit_id?: string | number,
    type?: string
}): Promise<void> => {
   throw new Error('Method not implemented')
};

export const event_message = async (msgs: {
    phone: string[],
    message: string,
    scheduled_notifications_id?: string | number
    link?: boolean,
    type?: string
}): Promise<void> => {
    throw new Error('Method not implemented')
};


export const event_banks = async (banks: any) => {
    throw new Error('Method not implemented')
};

export const event_group = async (data: {
    from: string
    msg: string
}) => {
    throw new Error('Method not implemented')
}

export const event_tracking = async (tracking: any) => {
    throw new Error('Method not implemented')
}

export const event_amounts = async (amounts: any) => {
    throw new Error('Method not implemented')
}
export const event_groups = async (groups: any) => {
    throw new Error('Method not implemented')
}

export const event_ticket = async (ticket: any) => {
    throw new Error('Method not implemented')
}

export const event_wppconnect_server = async (healthy: any) => {
    throw new Error('Method not implemented')
}