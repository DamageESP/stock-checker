import * as admin from 'firebase-admin'
import { sendNotification, timeStamp } from "../utils"
import { Product, ProductDataLog } from './types';

const puppeteer = require('puppeteer')
const serviceAccount = require("../lib/credentials.json")
const productList = require('../lib/productList.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://price-tracker-1c428.firebaseio.com",
})

const db = admin.database()

async function init() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox'],
  })

  const checkProduct = async (productData: Product) => {
    const tab = await browser.newPage()
    const { evaluate: siteEvaluator } = require(`./parsers/${productData.site}.ts`)

    // Setting the UA and the Language avoids triggering Cloudflare detection
    tab.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36')
    tab.setExtraHTTPHeaders({
      'Accept-Language': 'es'
    })

    console.log('checking product', productData.name)
    const newEntry = db.ref('data').push({
      ...productData,
      loading: true,
      date: Date.now(),
    })
    try {
      await tab.goto(productData.url)
      const productInformation = await tab.evaluate(siteEvaluator)
      newEntry.update({
        loading: false,
        isInStock: productInformation.isInStock,
        price: productInformation.price,
      })
      if (productInformation.isInStock) {
        sendNotification(productData)
          .catch((e: Error) => {
            console.log(`[${timeStamp()}] No se ha podido enviar la notificación de Pushed`, e.message)
            db.ref('/errors').push({
              msg: 'No se ha podido enviar la notificación de Pushed',
              date: Date.now(),
              details: e.message,
            })
          })
        console.log(`[${timeStamp()}] SÍ hay stock de ${productData.name} en @${productData.site}`)
      } else {
        console.log(`[${timeStamp()}] NO hay stock de ${productData.name} en @${productData.site}`)
      }
    } catch (e) {
      console.log(`[${timeStamp()}] No se ha podido obtener información de ${productData.name} en @${productData.site}`, e)
      db.ref('/errors').push({
        msg: `No se ha podido obtener información de ${productData.name} en @${productData.site}`,
        date: Date.now(),
        details: e,
      })
      newEntry.update({
        loading: false,
      })
    }
    await tab.close()
  }

  const checkStock = async (productList: Product[]) => {
    await Promise.all(productList.map(async (p, i) => {
      return new Promise<void>(resolve => {
        setTimeout(async () => {
          await checkProduct(p)
          resolve()
        }, i * 15 * 1000)
      })
    }))
    setTimeout(() => checkStock(productList), 15 * 1000)
  }

  checkStock(productList)
}

init()
