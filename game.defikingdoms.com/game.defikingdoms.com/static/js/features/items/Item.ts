import INVENTORYITEM_ABI from 'constants/abis/items/InventoryItem.json'
import { ChainId, BigintIsh } from 'constants/sdk-extra'
import { CustomEvent, Ingredient, ItemKeys, ItemType } from './types'

export class Item<T = ItemKeys> {
  key: T
  name: string
  description: string
  image: string
  type: ItemType
  addresses: { [key in ChainId]?: string }
  tokenSymbol?: string
  maxBurnRate?: BigintIsh
  marketPrice?: number
  salesPrice?: number
  craftingIngredients?: Ingredient[]
  featuredMetric?: boolean
  isConsumable?: boolean
  customEvents?: CustomEvent[]
  abi: any[]
  collectionItems?: ItemKeys[]
  quantity: number

  constructor(dataMap: {
    key: T
    name: string
    description: string
    image: string
    type: ItemType
    addresses: { [key in ChainId]?: string }
    tokenSymbol?: string
    marketPrice?: number
    salesPrice?: number
    craftingIngredients?: Ingredient[]
    featuredMetric?: boolean
    isConsumable?: boolean
    customEvents?: CustomEvent[]
    collectionItems?: ItemKeys[]
    abi?: any
  }) {
    this.key = dataMap.key
    this.name = dataMap.name
    this.description = dataMap.description
    this.image = dataMap.image
    this.type = dataMap.type
    this.tokenSymbol = dataMap.tokenSymbol || ''
    this.addresses = dataMap.addresses
    this.marketPrice = dataMap.marketPrice
    this.salesPrice = dataMap.salesPrice
    this.craftingIngredients = dataMap.craftingIngredients
    this.featuredMetric = dataMap.featuredMetric
    this.isConsumable = dataMap.isConsumable || false
    this.customEvents = dataMap.customEvents
    this.collectionItems = dataMap.collectionItems
    this.abi = dataMap.abi || INVENTORYITEM_ABI
    this.quantity = 0
  }
}
