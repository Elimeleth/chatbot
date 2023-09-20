import { isToday, differenceInSeconds, addMinutes, differenceInMinutes } from 'date-fns'

export const timedelta = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const localOffset = date.getTimezoneOffset(); // Time difference between local timezone and UTC in minutes
    const desiredOffset = -300; // Time difference between desired timezone and UTC in minutes (e.g. -300 for EST)
    const timeDiff = localOffset * 60 * 1000; // Time difference between timestamp and desired timezone in milliseconds
    const timedelta = new Date(date.getTime() - timeDiff)

    return timedelta
}

/**
 * 
 * @param sustract //> true = resta un dia, false = suma un dia
 * @returns //> {day, month, year, time} 
 */
 export const whichDate = (): {day: string | number, month: string | number, year: string | number, time: string} => {
    let date = new Date();

    let day: string|number = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

    let month: string| number = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    let year: string|number  = date.getFullYear();

    let hours: string|number = date.getHours();
    hours = hours < 10 ? '0' + hours : hours;

    let minutes: string|number  = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let seconds: string|number  = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    let time: string  = `${hours}:${minutes}:${seconds}`;

    return { day, month, year, time };
};

 /**
     *
     * @returns {number} A number for a distance given
     */
export const distanceIntoDates = (_oldDate: number|Date, _newDate: number|Date, diff: 'seconds'|'minutes'='seconds'): number => {
    
    let distance = 0
    if (diff === 'minutes') {
        distance = Math.abs(differenceInMinutes(_newDate, _oldDate))
    }else {
        distance = Math.abs(differenceInSeconds(_newDate, _oldDate))
    }
    return distance as number
}

    /**
     *
     * @returns {number} A number for a distance given
     */
export const _isToday = (_oldDate: number|Date): boolean|unknown => {
    try {
        const distance = isToday(_oldDate)
        return distance
    } catch (error: any) {
        return error
    }
}

export const _addMinutes = (date: Date|null, minutes: number = 5) => {
    const d = date ? date : new Date()
    
    return addMinutes(d, minutes)
}

export const dateToCron = (date: Date) => {
    const seconds = date.getSeconds()
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return `${seconds} ${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

