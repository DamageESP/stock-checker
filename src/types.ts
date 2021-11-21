export interface Product {
  id: string,
  site: string,
  url: string,
  name: string,
}

export interface ProductDataLog extends Product {
  loading: boolean,
  isInStock: boolean,
  date?: number,
  price?: string,
}

export interface ParserResponse {
  isInStock: boolean,
  price: string,
}