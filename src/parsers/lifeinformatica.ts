import { EvaluationResponse } from '../types'

export function evaluate(): EvaluationResponse {
  return {
    isInStock: (document.querySelector('.disponibilidad') as HTMLElement).classList.contains('in_stock'),
    price: ((document.querySelector('.precio .entero') as HTMLElement).innerText + (document.querySelector('.precio .decimales_precio') as HTMLElement).innerText) || "",
  }
}
