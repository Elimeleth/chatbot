export interface Amount {
    name:    string;
    code:    string;
    message: string;
    amounts: Amounts;
}

interface Amounts {
    min:      number;
    max:      number;
    multiple: number;
}
