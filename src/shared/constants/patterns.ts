export const EXPRESSION_PATTERN = {
    LINK_PREVIEW: /(http|https):\/\/([\w.-]+)(:\d+)?(\/[\w .-]*)*([\w@?^=%&\/~+-]*)?/gim,
    REFERENCE_CODE: /[^\D]/gm,
    ACTIVE_CODE: /[0-9]*/g,
    SERVICE_CODE: /^[a-zA-Z\s]{0,}/gim,
    SERVICE_BALANCE: /(412)/gi,
    SERVICE_AMOUNT: /^([0-9]{0,3}){0,2}(,|\.)?\d{0,2}$/g, // 250000 => 6 | 123456 => ref 6
    NUMBER_PHONE: /(0|58)?(412|416|414|424|426|242)\d{7}/g, // /412|416|414|424|426/g,
    CODE_NUMBER_PHONE: /(412|416|414|424|426)/g, // /412|416|414|424|426/g, 
    NUMBER_CONTRACT: /#?([0-9]{7,15})$/g,
    GIFT_CODE: /(?=(.*[0-9])).(?=(.*[a-z]))[a-z0-9]{1,}/gi,
    NUMBER_OPERATION: /#?([0-9]{10,15})/g,
    RECURRENT: /(MENSUAL|UNICO)/gi,
    DAY_MONTH: /^(-|\+)?([0-9]\d?)$/g,
    USERNAME: /[0-9]{0,}@c\.us/gi,
    BOLET: /#?([0-9]{7,15})/g,
    TYPEBOLET: /(VIP|NORMAL)/gim,
    BANK_REFERENCE: /[0-9]{4,}/gm,
    BANK: /[a-zA-Z]{3,}/gim,
    BANK_AMOUNT: /\d{1,3}(?:\.\d{2,3})*(?:,\d{2})?/gi
}