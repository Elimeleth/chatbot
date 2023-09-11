// CONEXION SOCKET 
import { io, Socket } from "socket.io-client";
import { Client, Events, MessageMedia } from "whatsapp-web.js";
import { EVENT, URL_SOCKET } from "../../shared/constants/enviroments";
import { action } from "./actions";

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
        return action(type, data)
    });
};
