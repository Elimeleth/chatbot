export type Service = {
  name: string;
  names: string[];
  service_code: string;
  service: string;
  code: string;
  recharge: boolean;
  maintenance: boolean;
  pin: boolean;
  hasTemplate: boolean;
  path_media: string|undefined;
  symbol: string;
  validate_amount: boolean;
  hasConsultFromOperator: boolean;
  hasConsutlFromAmountList: boolean;
  especial_amount: any[];
};