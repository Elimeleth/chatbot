export interface APIResponse {
	message: string;
	status_response: 'failed' | 'success';
	id?: string;
	type?: string;
	code?: string;
	qr?: Array<any>;
	image_url?: string;
	Extra_info?: ExtraInfo;
}

interface ExtraInfo {
	Duration_time: number;
	Server_datetime: string;
	quantity_insert: number;
	quantity_select: number;
	quantity_update: number;
}