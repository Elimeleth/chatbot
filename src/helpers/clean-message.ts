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


export const clean = ( /** @type {string} */ message: string): string => {
    let sanity_msg /** @type {string} */ = message;
    for (let letter of sanity_msg) {
        if (chars[letter]) {
            let newLetter = chars[letter];
            sanity_msg = sanity_msg.replace(letter, newLetter);
        }
    }

    return sanity_msg.startsWith('cambiar') ? sanity_msg.trim() : sanity_msg.toLowerCase().trim();
};