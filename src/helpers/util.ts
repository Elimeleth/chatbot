import { loader } from "./loader";

export const findKeyOrFail = (obj: any, keys: string[]) => {
    for (const key of keys) {
        if (obj[key] == null) {
          return false;
        }
    }

    return true;
}

export const objectToString = (object: any) => {
  let query = ''
  for (const [key, value] of Object.entries(object)) {
      if (object[key]) query += `/${key}/${value}`
  }

  return query
}

export const build_form = (
  form: any = {}, 
  keys: {
      name: string, 
      condition: (value: string, idx?: number) => boolean,
      condition_return_value?: (values: string[]) => string
  }[], 
  extra: string[],
): {
  form: any,
  extra: string[]
} => {
  
  for (const { name, condition, condition_return_value } of keys) {
      form[name] = condition_return_value ? condition_return_value(extra) : extra.find(condition)
  }

  Object.values(form).forEach(param => extra = extra.filter(e => e !== param))

  return {
    form, extra: extra || []
  }
}

/**@type {string|any} */
const chars: any = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  à: 'a',
  è: 'e',
  ì: 'i',
  ò: 'o',
  ù: 'u',
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  À: 'A',
  È: 'E',
  Ì: 'I',
  Ò: 'O',
  Ù: 'U'
};

export const parse_message_output = (message_to_parse: string, parses: { key: string; value: string;}[]) => {
  if (message_to_parse.startsWith('BOT:')) return loader("BOT_ERROR_FLOW")
  for (const parse of parses) {
    message_to_parse = message_to_parse.replace(parse.key, parse.value)
  }

  return message_to_parse
} 

export const clean = ( /** @type {string} */ message: string): string => {
  message = message.replace(/(\n|!|\*|_)/g, ' ').trim().toLowerCase()
  message = message.split(' ').filter((word) => Boolean(word.trim())).join(' ');
  let sanity_msg /** @type {string} */ = message;
  for (let letter of sanity_msg) {
      if (chars[letter]) {
          let newLetter = chars[letter];
          sanity_msg = sanity_msg.replace(letter, newLetter);
      }
  }

  return sanity_msg.toLowerCase().replace(/\n/gim, '').trim();
};