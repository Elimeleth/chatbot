import { distanceIntoDates } from "../../helpers/date";
import { loader } from "../../helpers/loader";
import { PATH_USER_HISTORY } from "../../shared/constants/enviroments";
import { CacheHistory } from "../../shared/interfaces/chat";
import fs from "fs"
import * as job from "node-cron"

export class Cache {

    constructor() {
        this.task();
    }

    get history(){
        return loader(null, PATH_USER_HISTORY) as CacheHistory[];
    }

    private task () {
        job.schedule('* * * * *', () => {
            const history = this.history

            if (!history || !history.length) return

            
            fs.writeFileSync(PATH_USER_HISTORY as string, JSON.stringify(
                history.filter(hst => 
                    distanceIntoDates(Number(hst.last_timestamp) * 1000, Date.now(), 'minutes') > 1
                    )
                , undefined, 1))
        })
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

    save(payload: CacheHistory) {
        let history = this.history || []

        const user = this.find(payload.username)

        if (user) {
            payload.last_timestamp = Date.now()
            payload.prev_message = user.last_message
            payload.prev_timestamp = user.last_timestamp
        }else {
            payload.last_timestamp = Date.now()
        }

        history = history.filter(hst => hst.username !== payload.username)
        history.push(payload)
        fs.writeFileSync(PATH_USER_HISTORY as string, JSON.stringify(history, undefined, 1))
    }
}