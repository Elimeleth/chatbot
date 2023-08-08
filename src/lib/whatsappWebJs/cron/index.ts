import * as cron from 'node-cron';

export const schedule = cron.schedule('*/10 * * * * *', async () => {   
   
}, {
    recoverMissedExecutions: true,
});