// CONEXION SOCKET 
import { io } from "socket.io-client";
import { EVENT, URL_SOCKET } from "../../shared/constants/enviroments";
import { action } from "./actions";

// *RETORNA ESTATUS DE CONEXION EN CASO DE ALGUNA EVENTUALIDAD EN WS
class XClientConnection {
    
    connect (url = URL_SOCKET) {
        const ws = io(url)
        ws.io.on('reconnect_attempt', (attempt) => {
            console.log('ATTEMPT XCLIENT RECONNECT', attempt);
        });
    
        ws.io.on('reconnect', (attempt) => {
            console.log('ATTEMPT RECONNECT ERROR', attempt);
        });
    
        // client-side
        ws.on('connect', () => {
            console.log(`CONNECTION ID ${ws.id} ESTABLISHED!`); // x8WIv7-mJelg7on_ALbx
        });
    
        ws.on('disconnect', (reason) => {
            console.log(`LOST CONNECTION ${reason}`); // undefined
    
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
    
                console.log('ATTEMPTING CONNECTION');
                ws.connect();
            }
        });
    
        ws.on('connect_error',  (error) => {
            console.log('CONNECTION ERROR', error);
            setTimeout(() => {
                console.log('ATTEMPTING CONNECTION OVER CONNECTION ERROR');
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
