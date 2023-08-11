import axios from 'axios'
import { URL_LOCALDB } from '../../shared/constants/enviroments'

class LocalDB {
    // ? CONEXION CON SERVICIO LOCALDB PARA MANEJO DE DATA CON BORRADO AUTOMATICO
    // ? ENCARGADO DEL MANEJO DE [GET|POST|PUT]
    async findOne (value:string): Promise<any> {
        let response: any
        try {
            const { data: { data } } = await axios.get(`${URL_LOCALDB}?username=${value}`)
            response = data[0]
        } catch (error: any) {
            response = null
        }
        return response
    }

    async create (body:{
        username: string,
        thread?: number,
        diff: number,
        payload?:any,
        expired_at: number
    }): Promise<any> {
        let response: any
        try {
            const { data } = await axios.post(`${URL_LOCALDB}`, { data: body })
            response = data
        } catch (error: any) {
            response = null
        }
        return response
    }

    async updateOne (body:{
        username: string,
        thread: number,
        diff: number,
        payload?:any,
        expired_at: number
    }): Promise<any> {
        let response: any
        try {
            const { data } = await axios.put(`${URL_LOCALDB}`, { data: body })
            response = data
        } catch (error: any) {
            response = null
        }
        return response
    }

    async trashOne (body:{
        username: string,
        thread: number,
        diff: number,
        payload?:any,
        expired_at: number
    }): Promise<any> {
        let response: any
        try {
            const { data } = await axios.post(`${URL_LOCALDB}/delete`, { data: body })
            response = data
        } catch (error: any) {
            response = null
        }
        return response
    }
}

export const localDB = new LocalDB();
