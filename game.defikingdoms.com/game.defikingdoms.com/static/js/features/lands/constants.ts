import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Region } from 'features/lands/types'

export const regionMap: Region[] = [
  {
    id: 0,
    name: 'Adelyn',
    landIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
  },
  {
    id: 1,
    name: 'Dornielle Abbey',
    landIds: [19, 20, 21, 22, 52, 53, 54]
  },
  {
    id: 2,
    name: 'Amoriath’s Domain',
    landIds: [23, 24, 25, 26, 27]
  },
  {
    id: 3,
    name: 'Gaeron’s Wood',
    landIds: [55, 56, 57, 58, 59, 60, 61, 62, 63]
  },
  {
    id: 4,
    name: 'Adelyn Highlands',
    landIds: [28, 29, 30, 64]
  },
  {
    id: 5,
    name: 'Riverhold',
    landIds: [31, 32, 65, 66, 67, 68, 69]
  },
  {
    id: 6,
    name: 'Illyria’s Rest',
    landIds: [70, 71, 72, 73]
  },
  {
    id: 7,
    name: 'Fairling Forest',
    landIds: [33, 74, 75, 76, 77]
  },
  {
    id: 8,
    name: 'Stillwood Meadow',
    landIds: [34, 35, 36]
  },
  {
    id: 9,
    name: 'Esterfork',
    landIds: [37, 38, 39, 78, 79, 80]
  },
  {
    id: 10,
    name: 'Breakwater Island',
    landIds: [81, 82, 83, 84, 85, 86]
  },
  {
    id: 11,
    name: 'Old King’s Barrow',
    landIds: [87, 88]
  },
  {
    id: 12,
    name: 'Amber Town',
    landIds: [40, 41, 42, 43, 44, 45, 46, 89]
  },
  {
    id: 13,
    name: 'Lake of Knives',
    landIds: [90, 91, 92, 93, 94, 95]
  },
  {
    id: 14,
    name: 'Stefan’s Lake',
    landIds: [47, 96, 97, 98, 99, 100]
  },
  {
    id: 15,
    name: 'Haywood',
    landIds: [48, 49, 50, 51]
  }
]

export const LANDCORE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xD5f5bE1037e457727e011ADE9Ca54d21c21a3F8A',
  [ChainId.HARMONY_TESTNET]: '0xDb4C51C17564a2382A17aeCBe9f17e2E64DFB45b',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const LANDAUCTION_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x77D991987ca85214f9686131C58c1ABE4C93E547',
  [ChainId.HARMONY_TESTNET]: '0xeB4D2946fB38CC1b553Fba4eDcAd64ef07A2ab06',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const defaultLandFilters = {
  lid: '',
  status: ['all'],
  resources: ['all'],
  regions: ['all']
}

export const defaultLandSorting = {
  field: 'id',
  direction: 'asc',
  type: 'number'
}

export const landStatuses = [
  {
    id: 'forSale',
    name: 'For Sale'
  },
  {
    id: 'notForSale',
    name: 'Not For Sale'
  },
  {
    id: 'vacant',
    name: 'Vacant'
  }
]

export const landSortOptions = [
  {
    id: 'id',
    name: 'ID',
    type: 'number'
  },
  {
    id: 'name',
    name: 'Name',
    type: 'string'
  },
  {
    id: 'region',
    name: 'Region',
    type: 'string'
  },
  {
    id: 'level',
    name: 'Level',
    type: 'number'
  },
  {
    id: 'startingPrice',
    name: 'Sale Price',
    type: 'number'
  }
]

export const landResources = [
  {
    id: 'gold',
    name: 'Gold'
  },
  {
    id: 'wood',
    name: 'Wood'
  },
  {
    id: 'stone',
    name: 'Stone'
  }
]
