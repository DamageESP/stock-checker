export interface Product {
  id: string,
  site: string,
  url: string,
  name: string,
  lastChecked?: number
}

export interface ProductDataLog extends Product {
  loading: boolean,
  isInStock: boolean,
  date?: number,
  price?: string,
}

export interface EvaluationResponse {
  isInStock: boolean,
  price: string,
}

export interface PushedAPICredentials {
  app_key: string,
  app_secret: string,
}
