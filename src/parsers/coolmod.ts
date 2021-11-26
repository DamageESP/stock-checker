import { EvaluationResponse } from '../types'

export function evaluate(): EvaluationResponse {
  return {
    isInStock: (document.querySelector('#messageStock') as HTMLElement).innerText !== 'Agotado',
    price: (document.querySelector('#normalpricenumber') as HTMLElement).innerText.replace(/\./g, '').replace(/,/g, '.'),
  }
}
