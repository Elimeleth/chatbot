// CONEXION SOCKET 
import { io, Socket } from "socket.io-client";
import { Client, Events, MessageMedia } from "whatsapp-web.js";
import { EVENT, URL_SOCKET } from "../../shared/constants/enviroments";

// *RETORNA ESTATUS DE CONEXION EN CASO DE ALGUNA EVENTUALIDAD EN WS
class XClientConnection {
    
    connect (url = URL_SOCKET) {
        const ws = io(url)
        ws.io.on('reconnect_attempt', () => {
            console.log('INTENTANDO RECONEXION CON WS');
        });
    
        ws.io.on('reconnect', (error) => {
            console.log('RECONECTANDO WS');
        });
    
        // client-side
        ws.on('connect', () => {
            console.log(`CONEXION CON ID ${ws.id} ESTABLECIDA!`); // x8WIv7-mJelg7on_ALbx
        });
    
        ws.on('disconnect', (reason) => {
            console.log(`CONEXION PERDIDA CON UNA RAZON ${reason}`); // undefined
    
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
    
                console.log('INTENTANDO RESTABLECER CONEXION CON SERVIDOR WS POR MOTIVOS DE CONEXION PERDIDA');
                ws.connect();
            }
        });
    
        ws.on('connect_error',  (error) => {
            setTimeout(() => {
                console.log('INTENTANDO RESTABLECER CONEXION CON SERVIDOR WS');
                ws.connect();
            }, 1000);
        });

        return ws
    };
}

// *ESTABLECE CONEXION CON EL SERVIDOR WS
/**
 * 
 * @param {Client}
 * @returns A connection Socket for request 
 */
export const connect_websocket: any = (): void => {
    const xclient = new XClientConnection()
    
    const connection = xclient.connect();

    //TODO: EVITAR TRACEBAK EN EVENTOS PARTICULARES 
    //! EVENTO DE NOTIFICACIONES DE MENSAJES
    /**
     * SE RECIBE EVENTOS Y DEPENDIENDO DEL TIPO SE EJECUTA UNA ACCION
     */
    
    connection.on(EVENT, async(data : any, type: any) => {
        
        // try {
        //     data = typeof data !== 'object' ? JSON.parse(data) : data;
            
        //     if (data.session && String(data.session).toLowerCase() === SESSION.toLowerCase()) {
        //         return action(type, data, client)
        //     }

        //     let user_history = validaFileExist(LOGS.LOGS_USER, 'sufix', undefined)
        //     if (user_history) user_history = new Map(Object.entries(user_history))

            
            
        //     if (data.phone) {
        //         if (user_history instanceof Map) {
        //             try {
        //                 data.phone = Array.isArray(data.phone) ? data.phone : [data.phone]
        //                 data.phone.forEach((phone: string) => {
        //                     if (!user_history.has(phone+'@c.us')) throw Error('user not found')
                            
        //                     return action(type, {
        //                         ...data,
        //                         phone
        //                     }, client)

        //                 })
        //             } catch (error) {
        //                 handleFileLog.log(LOGS.LOGS_CLIENT, {
        //                     socket: true,
        //                     event: type,
        //                     payload: JSON.stringify(data),
        //                     error: "Event message not emited"
        //                 })
        //             }
        //         }else {
        //             handleFileLog.log(LOGS.LOGS_CLIENT, {
        //                 socket: true,
        //                 event: type,
        //                 payload: JSON.stringify(data),
        //                 error: "Event message not emited"
        //             })
        //         }
        //     }else {
        //         return action(type, data, client)
        //     }
            
        // } catch (error: any) {
        //     handleFileLog.traceback_error(error.message);
        // }
    });
};
