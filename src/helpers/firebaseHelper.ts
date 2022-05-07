import { Product } from "../types"

export const mapKeyToId = <T>([key, value]: [string, T]) => ({ id: key, ...value })

export const sortOldestCheckedFirst = (p1: Product, p2: Product): number => {
  if (!p1.lastChecked) return -1
  if (!p2.lastChecked) return 1
  return p1.lastChecked > p2.lastChecked ? 1 : -1
}