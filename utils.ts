import pushedConfig from "./config"
import { Product } from "./src/types"
import { appendFile } from 'fs/promises'
import { db } from "./src/lib/db"

const fetch = require('node-fetch')
const FormData = require('form-data')

// https://gist.github.com/hurjas/2660489
export function timeStamp() {
  // Create a date object with the current time
  var now = new Date()

  // Create an array with the current month, day and time
  var date = [now.getDate(), now.getMonth() + 1, now.getFullYear()]

  // Create an array with the current hour, minute and second
  var time = [now.getHours().toString(), now.getMinutes().toString(), now.getSeconds().toString()]

  // Determine AM or PM suffix based on the hour
  var suffix = (parseInt(time[0]) < 12) ? 'AM' : 'PM'

  // Convert hour from military time
  time[0] = (parseInt(time[0]) < 12) ? time[0] : (parseInt(time[0]) - 12).toString()

  // If hour is 0, set it to 12
  time[0] = time[0] || '12'

  // If seconds and minutes are less than 10, add a zero
  for (var i = 1; i < 3; i++) {
    if (parseInt(time[i]) < 10) {
      time[i] = '0' + time[i]
    }
  }

  // Return the formatted string
  return date.join('/') + ' ' + time.join(':') + ' ' + suffix
}

export async function sendNotification(productData: Product) {
  if (!pushedConfig?.app_key) throw new Error('No Pushed configuration available')

  const formData = new FormData()
  formData.append('app_key', pushedConfig.app_key)
  formData.append('app_secret', pushedConfig.app_secret)
  formData.append('target_type', 'app')
  formData.append('content', `Hay stock de ${productData.name} en @${productData.site}`)
  formData.append('content_type', 'url')
  formData.append('content_extra', productData.site)

  await fetch('https://api.pushed.co/1/push', {
    method: 'POST',
    body: formData,
  })
}

export function log(...info: string[]): void {
  console.log(...info.map(l => `[${timeStamp()}] ${l}`))
  appendFile('log', info.map(l => `[${timeStamp()}] ${l}`).join('\n'), 'utf8')
    .catch(() => { })
  db.ref('/errors').push({
    msg: 'No se ha podido enviar la notificación de Pushed',
    date: Date.now(),
    details: info.map(l => `[${timeStamp()}] ${l}`),
  })
}

export function todayYYYYMDD() {
  const date = new Date()
  return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
}

export const calculateAveragePrice = (previousPrices: number[], productPrice: number): number => {
  return Object.values(previousPrices).reduce((acc, cur) => {
    acc += cur
    return acc
  }, productPrice) / (previousPrices.length + 1)
}
