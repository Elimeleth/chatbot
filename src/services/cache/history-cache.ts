import { distanceIntoDates } from "../../helpers/date";
import { loader } from "../../helpers/loader";
import { PATH_CONFIGURATIONS, PATH_USER_HISTORY } from "../../shared/constants/enviroments";
import { CacheHistory } from "../../shared/interfaces/chat";
import fs from "fs"
import * as job from "node-cron"

class Cache {
    users = new Map<string, any>();

    constructor() {
        this.task();
    }

    get history(){
        return loader(null, PATH_USER_HISTORY) as CacheHistory[];
    }

    user (username: string) {
        return this.users.get(username) || null
    }

    private task () {
        job.schedule('* * * * *', () => {
            if (!this.users.size) return

            for (const [username, value] of this.users) {
                const diff = distanceIntoDates(Number(value.last_timestamp) * 1000, Date.now(), 'minutes')
                if (diff > 1) {
                    this.users.delete(username)
                }
            }
        })
    }

    private existHistory (username: string, message: string) {
        const user = this.users.get(username) as CacheHistory
        return !!(
            user.last_message === message &&
            distanceIntoDates(Number(user.last_timestamp), Date.now(), 'seconds') < Number(loader("ANTISPAM_EVALUATE_SECONDS", PATH_CONFIGURATIONS))
            )
    }

    antispam (username: string, message: string, isMe: boolean = false) {
        if (!this.users.has(username)) return false
    
        return this.existHistory(username, message)
    }

    save(payload: Partial<CacheHistory>) {
        if (!payload.username) return
        // let history = this.history || []

        const user = this.users.get(payload.username) || null

        if (user) {
            payload.prev_message = user.last_message
            payload.prev_message_bot = user.last_message_bot
            payload.prev_timestamp_bot = user.last_timestamp_bot
            payload.prev_timestamp = user.last_timestamp
            
            payload = Object.assign(user, payload)
            
        }else {
            payload.error_count = 0
        }
        this.users.set(payload.username as string, payload)
        // history = history.filter(hst => hst.username !== payload.username)
        // history.push(payload)
        // fs.writeFileSync(PATH_USER_HISTORY as string, JSON.stringify(history, undefined, 1))
    }
}

export const cache = new Cache()