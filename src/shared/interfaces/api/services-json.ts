export type Service = {
  name: string;
  service_code: string;
  service: string;
  code: string;
  recharge: boolean;
  maintenance: boolean;
  pin: boolean;
  validate_amount: boolean;
  isConsultable: boolean;
  especial_amount: any[];
};