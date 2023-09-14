export const change_state = {
    name: 'change_state',
    cb: async (client_state: string) => {
        console.log({
            client_state
        })
    }
}