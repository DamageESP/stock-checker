import * as admin from 'firebase-admin'
import { log, sendNotification, todayYYYYMDD } from "../utils"
import { EvaluationResponse, Product } from './types';

const puppeteer = require('puppeteer')
const serviceAccount = require("../lib/credentials.json")

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

    log('checking product ' + productData.name)
    const queryDate = Date.now()
    const newEntry = db.ref('data').push({
      productName: productData.name,
      productId: productData.id,
      productUrl: productData.url,
      productSite: productData.site,
      loading: true,
      date: queryDate,
    })
    try {
      await tab.goto(productData.url)
      const productInformation: EvaluationResponse = await tab.evaluate(siteEvaluator)
      newEntry.update({
        loading: false,
        isInStock: productInformation.isInStock,
        productPrice: productInformation.price,
      })
      if (productInformation.isInStock) {
        db.ref(`/latestStock/${productData.id}`).set({
          productName: productData.name,
          productPrice: productInformation.price,
          productUrl: productData.url,
          productSite: productData.site,
          date: queryDate,
        })
        try {
          await sendNotification(productData)
        } catch (e) {
          log(`No se ha podido enviar la notificación de Pushed\n${e.message}`)
          db.ref('/errors').push({
            msg: 'No se ha podido enviar la notificación de Pushed',
            date: Date.now(),
            details: e.message,
          })
        }
        log(`SÍ hay stock de ${productData.name} en @${productData.site}`)
      } else {
        const inStockProduct = await db.ref(`/latestStock/${productData.id}`).get()
        if (inStockProduct.exists()) {
          db.ref(`/sales`).push({
            productId: productData.id,
            productName: productData.name,
            productUrl: productData.url,
            productSite: productData.site,
            productPrice: inStockProduct.val().productPrice,
            date: Date.now(),
          })
          const currentAvgPrice = await db.ref(`/avgPrices/${productData.id}`).get()
          const numSales = currentAvgPrice.exists() ? parseInt(currentAvgPrice.val().numSales) + 1 : 1
          let averagePrice = parseFloat(inStockProduct.val().productPrice)
          const previousPrices = await db.ref(`/sellingPrices/${productData.id}/${todayYYYYMDD()}/prices`).get()
          if (previousPrices.exists()) {
            averagePrice = (previousPrices.val() as number[]).reduce((acc, cur) => {
              acc += cur
              return acc
            }, parseFloat(inStockProduct.val().productPrice)) / ((previousPrices.val() as number[]).length + 1)
          }
          db.ref(`/sellingPrices/${productData.id}/${todayYYYYMDD()}/prices`).push(parseFloat(inStockProduct.val().productPrice))
          db.ref(`/sellingPrices/${productData.id}/${todayYYYYMDD()}`).set({
            productName: productData.name,
            productUrl: productData.url,
            productSite: productData.site,
            numSales,
            averagePrice,
            lastSale: Date.now(),
          })
          log(`Se ha vendido ${productData.name} a un precio de ${inStockProduct.val().productPrice} en @${productData.site}`)
        }
        log(`NO hay stock de ${productData.name} en @${productData.site}`)
      }
    } catch (e) {
      log(`No se ha podido obtener información de ${productData.name} en @${productData.site}\n${e}`)
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
    const productData = await db.ref('/products').get()
    if (!productData.val()) {
      db.ref('/errors').push({
        msg: `No se han encontrado productos para comprobar.`,
        date: Date.now(),
      })
      return
    }
    const newProductList: Product[] = Object.entries(productData.val()).map(([key, value]: [string, Product]) => ({ id: key, ...value }))
    setTimeout(() => checkStock(newProductList), 15 * 1000)
  }

  const productData = await db.ref('/products').get()
  if (!productData.val()) {
    db.ref('/errors').push({
      msg: `No se han encontrado productos para comprobar.`,
      date: Date.now(),
    })
    return
  }
  const productList: Product[] = Object.entries(productData.val()).map(([key, value]: [string, Product]) => ({ id: key, ...value }))
  checkStock(productList)
}

init()
