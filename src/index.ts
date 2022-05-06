import { calculateAveragePrice, log, sendNotification } from "../utils"
import { setProductStock, createEmptyEvaluationData, postSale, updateEvaluationData, getStockForProduct, getAveragePriceDataForProduct, getSellingPricesForProduct, setSellingDataForProduct, addSellingPriceForProduct, getProductList, deleteProductStock } from './services/productService';
import { EvaluationResponse, Product } from './types';
import { mapKeyToId } from './helpers/firebaseHelper';

const puppeteer = require('puppeteer')

export async function programLoop() {
  const browser = await puppeteer.launch({
    headless: true,
    /* executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox'], */
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
    const newEntry = createEmptyEvaluationData(productData, queryDate)
    try {
      await tab.goto(productData.url)
      const evaluationData: EvaluationResponse = await tab.evaluate(siteEvaluator)
      updateEvaluationData(newEntry, evaluationData)
      if (evaluationData.isInStock) {
        setProductStock(productData, evaluationData, queryDate)
        try {
          await sendNotification(productData)
        } catch (e: any) {
          log(`No se ha podido enviar la notificación de Pushed\n${e.message}`)
        }
        log(`SÍ hay stock de ${productData.name} en @${productData.site}`)
      } else {
        const inStockProduct = await getStockForProduct(productData.id)
        if (inStockProduct.exists()) {
          postSale(productData, inStockProduct.val().productPrice)
          const currentAvgPrice = await getAveragePriceDataForProduct(productData.id)
          const numSales = currentAvgPrice.exists() ? parseInt(currentAvgPrice.val().numSales) + 1 : 1
          let averagePrice = parseFloat(inStockProduct.val().productPrice)
          const previousPrices = await getSellingPricesForProduct(productData.id)
          if (previousPrices.exists()) {
            averagePrice = calculateAveragePrice(Object.values(previousPrices.val() as number[]), parseFloat(inStockProduct.val().productPrice))
          }
          setSellingDataForProduct(productData, numSales, averagePrice)
          addSellingPriceForProduct(productData, parseFloat(inStockProduct.val().productPrice))
          log(`Se ha vendido ${productData.name} a un precio de ${inStockProduct.val().productPrice} en @${productData.site}`)
        }
        log(`NO hay stock de ${productData.name} en @${productData.site}`)
        deleteProductStock(productData.id)
      }
    } catch (e) {
      log(`No se ha podido obtener información de ${productData.name} en @${productData.site}\n${e}`)
      newEntry.update({
        loading: false,
      })
    }
    await tab.close()
  }

  const checkStock = async () => {
    const productData = await getProductList()
    if (!productData.val()) {
      log(`No se han encontrado productos para comprobar.`)
      return
    }
    const productList: Product[] = Object.entries(productData.val()).map(mapKeyToId)
    await Promise.all(productList.map(async (p, i) => {
      return new Promise<void>(resolve => {
        setTimeout(async () => {
          await checkProduct(p)
          resolve()
        }, i * 10 * 1000)
      })
    }))
    setTimeout(() => checkStock(), 10 * 1000)
  }

  checkStock()
}

programLoop()
