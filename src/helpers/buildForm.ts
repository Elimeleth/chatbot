export const build_form = (form: any = {}, keys: {name: string, condition: (value: string, idx?: number) => boolean}[], values: string[]) => {
    
    for (const { name, condition } of keys) {
        form[name] = values.find(condition)
    }

    return form
}