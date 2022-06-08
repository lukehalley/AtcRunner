import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Item } from 'features/items/Item'
import { itemMap } from 'features/items/constants'
import { ItemKeys } from 'features/items/types'

export const JOURNEY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xE92Db3bb6E4B21a8b9123e7FdAdD887133C64bb7',
  [ChainId.HARMONY_TESTNET]: '0x795F6AF5Aa45Ec351A8fC74705F0874CA5f67F42',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const GRAVEYARD_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x9CC714059943D5A726fAD11087Bb6d9Ab811A2E3',
  [ChainId.HARMONY_TESTNET]: '0xACebA5E9b4D6848fDe33853A0cfDA7414a840006',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const crystalRewardMap = [
  [18, 22, 34, 159],
  [21, 25, 43, 223],
  [26, 38, 88, 463],
  [50, 79, 185, 780],
  [80, 181, 606, 1292]
]

export const jewelRewardMap = [
  [5, 7, 10, 15],
  [7, 10, 14, 20],
  [10, 16, 22, 28],
  [15, 25, 35, 50],
  [25, 40, 55, 80]
]

export const stoneRewardMapping = [
  // Common Rarity
  [
    [
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 3, grade: 'Lesser', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: false },
      { quantity: 3, grade: 'Lesser', type: 'Crystal', primary: true },
      { quantity: 3, grade: 'Lesser', type: 'Crystal', primary: false }
    ],
    [
      { quantity: 1, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 3, grade: 'standard', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 1, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 1, grade: 'standard', type: 'Stone', primary: false },
      { quantity: 3, grade: 'standard', type: 'Crystal', primary: true },
      { quantity: 3, grade: 'standard', type: 'Crystal', primary: false }
    ]
  ],
  // Uncommon Rarity
  [
    [
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 5, grade: 'Lesser', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 1, grade: 'Lesser', type: 'Stone', primary: false },
      { quantity: 5, grade: 'Lesser', type: 'Crystal', primary: true },
      { quantity: 5, grade: 'Lesser', type: 'Crystal', primary: false }
    ],
    [
      { quantity: 1, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 5, grade: 'standard', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 1, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 1, grade: 'standard', type: 'Stone', primary: false },
      { quantity: 5, grade: 'standard', type: 'Crystal', primary: true },
      { quantity: 5, grade: 'standard', type: 'Crystal', primary: false }
    ]
  ],
  // Rare Rarity
  [
    [
      { quantity: 2, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 7, grade: 'Lesser', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 2, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 2, grade: 'Lesser', type: 'Stone', primary: false },
      { quantity: 7, grade: 'Lesser', type: 'Crystal', primary: true },
      { quantity: 7, grade: 'Lesser', type: 'Crystal', primary: false }
    ],
    [
      { quantity: 2, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 7, grade: 'standard', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 2, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 2, grade: 'standard', type: 'Stone', primary: false },
      { quantity: 7, grade: 'standard', type: 'Crystal', primary: true },
      { quantity: 7, grade: 'standard', type: 'Crystal', primary: false }
    ]
  ],
  // Legendary Rarity
  [
    [
      { quantity: 3, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 10, grade: 'Lesser', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 3, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 3, grade: 'Lesser', type: 'Stone', primary: false },
      { quantity: 10, grade: 'Lesser', type: 'Crystal', primary: true },
      { quantity: 10, grade: 'Lesser', type: 'Crystal', primary: false }
    ],
    [
      { quantity: 3, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 10, grade: 'standard', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 3, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 3, grade: 'standard', type: 'Stone', primary: false },
      { quantity: 10, grade: 'standard', type: 'Crystal', primary: true },
      { quantity: 10, grade: 'standard', type: 'Crystal', primary: false }
    ]
  ],
  // Mythic Rarity
  [
    [
      { quantity: 5, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 15, grade: 'Lesser', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 5, grade: 'Lesser', type: 'Stone', primary: true },
      { quantity: 5, grade: 'Lesser', type: 'Stone', primary: false },
      { quantity: 15, grade: 'Lesser', type: 'Crystal', primary: true },
      { quantity: 15, grade: 'Lesser', type: 'Crystal', primary: false }
    ],
    [
      { quantity: 5, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 15, grade: 'standard', type: 'Crystal', primary: true }
    ],
    [
      { quantity: 5, grade: 'standard', type: 'Stone', primary: true },
      { quantity: 5, grade: 'standard', type: 'Stone', primary: false },
      { quantity: 15, grade: 'standard', type: 'Crystal', primary: true },
      { quantity: 15, grade: 'standard', type: 'Crystal', primary: false }
    ]
  ]
]

export const stoneStatsMapping: { [index: string]: string } = {
  strength: 'Might',
  dexterity: 'Finesse',
  agility: 'Swiftness',
  vitality: 'Vigor',
  endurance: 'Fortitude',
  intelligence: 'Wit',
  wisdom: 'Insight',
  luck: 'Fortune'
}

export const stoneStatsAddressMapping: {
  [index: string]: {
    [index: string]: {
      crystal: Item<ItemKeys>
      stone: Item<ItemKeys>
    }
  }
} = {
  strength: {
    lesser: {
      crystal: itemMap[ItemKeys.MIGHT_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.MIGHT_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.MIGHT_CRYSTAL],
      stone: itemMap[ItemKeys.MIGHT_STONE]
    }
  },
  dexterity: {
    lesser: {
      crystal: itemMap[ItemKeys.FINESSE_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.FINESSE_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.FINESSE_CRYSTAL],
      stone: itemMap[ItemKeys.FINESSE_STONE]
    }
  },
  agility: {
    lesser: {
      crystal: itemMap[ItemKeys.SWIFTNESS_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.SWIFTNESS_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.SWIFTNESS_CRYSTAL],
      stone: itemMap[ItemKeys.SWIFTNESS_STONE]
    }
  },
  vitality: {
    lesser: {
      crystal: itemMap[ItemKeys.VIGOR_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.VIGOR_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.VIGOR_CRYSTAL],
      stone: itemMap[ItemKeys.VIGOR_STONE]
    }
  },
  endurance: {
    lesser: {
      crystal: itemMap[ItemKeys.FORTITUDE_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.FORTITUDE_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.FORTITUDE_CRYSTAL],
      stone: itemMap[ItemKeys.FORTITUDE_STONE]
    }
  },
  intelligence: {
    lesser: {
      crystal: itemMap[ItemKeys.WIT_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.WIT_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.WIT_CRYSTAL],
      stone: itemMap[ItemKeys.WIT_STONE]
    }
  },
  wisdom: {
    lesser: {
      crystal: itemMap[ItemKeys.INSIGHT_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.INSIGHT_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.INSIGHT_CRYSTAL],
      stone: itemMap[ItemKeys.INSIGHT_STONE]
    }
  },
  luck: {
    lesser: {
      crystal: itemMap[ItemKeys.FORTUNE_CRYSTAL_LESSER],
      stone: itemMap[ItemKeys.FORTUNE_STONE_LESSER]
    },
    standard: {
      crystal: itemMap[ItemKeys.FORTUNE_CRYSTAL],
      stone: itemMap[ItemKeys.FORTUNE_STONE]
    }
  }
}
