import { EvaluationResponse } from '../types'

export function evaluate(): EvaluationResponse {
  return {
    isInStock: (document.querySelector('.btn.buy') as HTMLElement).innerText !== 'Avísame]',
    price: (document.querySelector('[data-price]') as HTMLElement).dataset.price,
  }
}
