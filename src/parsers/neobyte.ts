import { EvaluationResponse } from '../types'

export function evaluate(): EvaluationResponse {
  return {
    isInStock: (document.querySelector('#product-availability') as HTMLElement).classList.contains('product-available'),
    price: (document.querySelector('.product-price') as HTMLElement).getAttribute('content') || "",
  }
}
