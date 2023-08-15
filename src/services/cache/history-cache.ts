import { loader } from "../../helpers/loader";
import { PATH_USER_HISTORY } from "../../shared/constants/enviroments";
import { CacheHistory } from "../../shared/interfaces/chat";
import fs from "fs"

export class Cache {

    get history(){
        return loader(null, PATH_USER_HISTORY) as CacheHistory[];
    }

    existHistory (username: string, query: string) {
        const history = this.history

        if (!history || !history.length) return false

        return history.some(history => (
            history.username === username &&
            [history.last_message, 
                history.message_id].includes(query)
        ))
    }

    find(query: string): CacheHistory|null {
        const history = this.history
        
        if (!history || history.length) return null

        return history.find(history => (
            [history.last_message, 
                history.message_id, history.username].includes(query)
        )) || null
    }

    save(query: string, payload: CacheHistory) {
        let history = this.history || []

        const user = this.find(query)

        const data: CacheHistory =  {
            username: payload.username,
            message_id: payload.message_id,
            last_message: payload.last_message,
            last_timestamp: Date.now()
        }
        
        if (!user) {
            history.push(data)
        }else {
            payload.last_timestamp = Date.now()
            payload.prev_message = user.last_message
            payload.prev_timestamp = user.last_timestamp
            
            history = history.filter(hst => hst.username !== user.username)
            history.push(payload)
        }


        fs.writeFileSync(PATH_USER_HISTORY as string, JSON.stringify(history, undefined, 1))
    }
}