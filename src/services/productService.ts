import { db } from "../lib/db"
import { EvaluationResponse, Product } from "../types"
import { ThenableReference } from 'firebase-admin/database'
import { todayYYYYMDD } from "../../utils"

export const postSale = (productData: Product, price: string) => {
  db.ref(`/sales`).push({
    productId: productData.id,
    productName: productData.name,
    productUrl: productData.url,
    productSite: productData.site,
    productPrice: price,
    date: Date.now(),
  })
}

export const createEmptyEvaluationData = (productData: Product, date: number) => {
  return db.ref('data').push({
    productName: productData.name,
    productId: productData.id,
    productUrl: productData.url,
    productSite: productData.site,
    loading: true,
    date,
  })
}
export const updateEvaluationData = (productRef: ThenableReference, evaluationData: EvaluationResponse) => {
  productRef.update({
    loading: false,
    isInStock: evaluationData.isInStock,
    productPrice: evaluationData.price,
  })
}

export const setProductStock = (productData: Product, evaluationData: EvaluationResponse, date: number) => {
  db.ref(`/latestStock/${productData.id}`).set({
    productName: productData.name,
    productPrice: evaluationData.price,
    productUrl: productData.url,
    productSite: productData.site,
    date,
  })
}

export const deleteProductStock = (productId: string) => {
  db.ref(`/latestStock/${productId}`).remove()
}

export const getStockForProduct = (productId: string) => {
  return db.ref(`/latestStock/${productId}`).get()
}

export const getAveragePriceDataForProduct = (productId: string) => {
  return db.ref(`/avgPrices/${productId}`).get()
}

export const getSellingPricesForProduct = (productId: string, date = todayYYYYMDD()) => {
  return db.ref(`/sellingPrices/${productId}/${date}/prices`).get()
}

export const setSellingDataForProduct = (productData: Product, numSales: number, averagePrice: number, date = todayYYYYMDD()) => {
  db.ref(`/sellingPrices/${productData.id}/${date}`).set({
    productName: productData.name,
    productUrl: productData.url,
    productSite: productData.site,
    numSales,
    averagePrice,
    lastSale: Date.now(),
  })
}

export const addSellingPriceForProduct = (productData: Product, price: number, date = todayYYYYMDD()) => {
  db.ref(`/sellingPrices/${productData.id}/${date}/prices`).push(price)
}

export const getProductList = () => {
  return db.ref('/products').get()
}
