export interface Product {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export type IntegrationRedirect = (
  businessId: string,
  name: string,
) => string;

export type IntegrationCallback = (
  businessId: string,
  name: string,
  code: string,
  shop: string,
) => Promise<void>;
