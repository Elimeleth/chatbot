export const build_form = (
    form: any = {}, 
    keys: {
        name: string, 
        condition: (value: string, idx?: number) => boolean,
        condition_return_value?: (values: string[]) => string
    }[], 
    values: string[],
) => {
    
    for (const { name, condition, condition_return_value } of keys) {
        form[name] = condition_return_value ? condition_return_value(values) : values.find(condition)
    }

    return form
}