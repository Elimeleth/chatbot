import * as qrcode from "qrcode-terminal"

export const qr = {
    name: 'qr',
    cb: (qr: any) => {
        qrcode.generate(qr, { small: true });
    }
}