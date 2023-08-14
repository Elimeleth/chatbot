export type Service = {
  name: string;
  names: string[];
  service_code: string;
  service: string;
  code: string;
  recharge: boolean;
  maintenance: boolean;
  pin: boolean;
  validate_amount: boolean;
  hasConsultFromOperator: boolean;
  hasConsutlFromAmountList: boolean;
  especial_amount: any[];
};