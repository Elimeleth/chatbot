export interface APIResponse {
	message: string;
	status_response: typeof STATUS_RESPONSE_FAILED | typeof STATUS_RESPONSE_SUCCES;
	id?: string;
	type?: string;
	code?: string;
	qr?: Array<any>;
	image_url?: string;
	Extra_info?: ExtraInfo;
}

export const STATUS_RESPONSE_SUCCES = 'success'
export const STATUS_RESPONSE_FAILED = 'failed'

interface ExtraInfo {
	Duration_time: number;
	Server_datetime: string;
	quantity_insert: number;
	quantity_select: number;
	quantity_update: number;
}