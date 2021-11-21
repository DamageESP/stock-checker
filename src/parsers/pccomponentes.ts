import { ParserResponse } from '../types'

export function evaluate(): ParserResponse {
  return {
    isInStock: (document.querySelector('.btn.buy') as HTMLElement).innerText !== 'Avísame]',
    price: (document.querySelector('[data-price]') as HTMLElement).dataset.price,
  }
}
