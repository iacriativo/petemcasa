import { JsonDataStore } from './JsonDataStore'
import type { DataStore } from './interface'

let store: DataStore | null = null

export function getDataStore(): DataStore {
  if (store) return store
  store = new JsonDataStore()
  return store
}

export { JsonDataStore }
export type { DataStore }
export * from './interface'
