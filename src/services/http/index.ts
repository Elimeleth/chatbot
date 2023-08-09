import axios, { AxiosRequestConfig } from 'axios';
import { APIResponse } from '../../shared/interfaces/api/fetch-response';

const data_failed: APIResponse = {
	message: 'Si no tiene respuesta, vuelva a intentar en otro momento, disculpe las molestias ocasionadas.',
	status_response: 'failed'
}
export let endFetchTime = 0
export const httpClient = async (fetchOpts: AxiosRequestConfig): Promise<any> => {
	if (!fetchOpts) throw Error('Fetch options is required');
	let controller = (new AbortController)
	const start = process.hrtime();
	try {
		const { data } = await axios({
			...fetchOpts,
			headers: {
				sign: 'biyuyo_whatsapp',
				...fetchOpts.headers,
			},
			signal: controller.signal,
			cancelToken: axios.CancelToken.source().token
		});
		endFetchTime = process.hrtime(start)[0]
		return data
	} catch (error: any) {
		endFetchTime = process.hrtime(start)[0] 

		if (axios.isCancel(error)) {
			controller.abort()
		}

		if (error.response) {
			return error.response.data
		}else {
			controller.abort()
		}

		return data_failed
	}
};