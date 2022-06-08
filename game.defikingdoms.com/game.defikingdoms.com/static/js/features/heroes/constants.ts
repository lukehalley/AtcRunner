import { ChainId } from 'constants/sdk-extra'
import { Request } from './types'

export const REQUEST: Request = {
  heroes: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_heroes',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_heroes',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_heroes',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_heroes',
    [ChainId.DFK_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_heroes',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_heroes',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  },
  salesAuctions: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_saleauctions',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_saleauctions',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_saleauctions',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_saleauctions',
    [ChainId.DFK_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_saleauctions',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_saleauctions',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  },
  assistAuctions: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_assistauctions',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_assistauctions',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_assistauctions',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_assistauctions',
    [ChainId.DFK_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_assistauctions',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_assistauctions',
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.BSC_MAINNET]: '',
    [ChainId.BSC_TESTNET]: '',
    [ChainId.HARDHAT]: ''
  }
}

export const basicClasses = [
  'warrior',
  'knight',
  'thief',
  'archer',
  'priest',
  'wizard',
  'monk',
  'pirate',
  'berserker',
  'seer'
]
export const advancedClasses = ['paladin', 'darkKnight', 'summoner', 'ninja', 'shapeshifter']
export const eliteClasses = ['dragoon', 'sage']
export const exaltedClasses = ['dreadKnight']

export const shiny = ['yes', 'no']

export const statuses = ['for_sale', 'for_hire', 'on_a_quest']

export const stats = [
  {
    value: 'strength',
    label: 'Strength',
    abbr: 'STR'
  },
  {
    value: 'dexterity',
    label: 'Dexterity',
    abbr: 'DEX'
  },
  {
    value: 'agility',
    label: 'Agility',
    abbr: 'AGI'
  },
  {
    value: 'vitality',
    label: 'Vitality',
    abbr: 'VIT'
  },
  {
    value: 'endurance',
    label: 'Endurance',
    abbr: 'END'
  },
  {
    value: 'intelligence',
    label: 'Intelligence',
    abbr: 'INT'
  },
  {
    value: 'wisdom',
    label: 'Wisdom',
    abbr: 'WIS'
  },
  {
    value: 'luck',
    label: 'Luck',
    abbr: 'LCK'
  }
]

export const baseStats = [
  {
    value: 'hp',
    label: 'Hit Points',
    abbr: 'HP'
  },
  {
    value: 'mp',
    label: 'Mana Points',
    abbr: 'MP'
  },
  {
    value: 'stamina',
    label: 'Stamina',
    abbr: 'STA'
  }
]

export const statBonusValues = [
  'strength',
  'intelligence',
  'wisdom',
  'luck',
  'agility',
  'vitality',
  'endurance',
  'dexterity'
]

export const statMapping = {
  str: {
    value: 'strength'
  },
  int: {
    value: 'intelligence'
  },
  wis: {
    value: 'wisdom'
  },
  lck: {
    value: 'luck'
  },
  agi: {
    value: 'agility'
  },
  vit: {
    value: 'vitality'
  },
  end: {
    value: 'endurance'
  },
  dex: {
    value: 'dexterity'
  }
}

export interface StatMappingInterface {
  str: {
    value: string
  }
}

export const RARITY_COMMON = 'common'
export const RARITY_UNCOMMON = 'uncommon'
export const RARITY_RARE = 'rare'
export const RARITY_LEGENDARY = 'legendary'
export const RARITY_MYTHIC = 'mythic'
export const RARITY_COLORS: any = {
  [RARITY_COMMON]: '#FFFFFF',
  [RARITY_UNCOMMON]: '#14C25A',
  [RARITY_RARE]: '#21CCFF',
  [RARITY_LEGENDARY]: '#ffa32d',
  [RARITY_MYTHIC]: '#df5bff'
}
export const RARITY_LEVELS = [RARITY_COMMON, RARITY_UNCOMMON, RARITY_RARE, RARITY_LEGENDARY, RARITY_MYTHIC] as const

export const visualGenesMap: { [index: number]: string } = {
  0: 'gender',
  1: 'headAppendage',
  2: 'backAppendage',
  3: 'background',
  4: 'hairStyle',
  5: 'hairColor',
  6: 'visualUnknown1',
  7: 'eyeColor',
  8: 'skinColor',
  9: 'appendageColor',
  10: 'backAppendageColor',
  11: 'visualUnknown2'
} as const

export const statsGenesMap = {
  0: 'class',
  1: 'subClass',
  2: 'profession',
  3: 'passive1',
  4: 'passive2',
  5: 'active1',
  6: 'active2',
  7: 'statBoost1',
  8: 'statBoost2',
  9: 'statsUnknown1',
  10: 'element',
  11: 'statsUnknown2'
} as const

export const statsAbbreviationMap = {
  strength: 'STR',
  dexterity: 'DEX',
  agility: 'AGI',
  vitality: 'VIT',
  endurance: 'END',
  intelligence: 'INT',
  wisdom: 'WIS',
  luck: 'LCK'
} as const

export const classes = {
  0: 'warrior',
  1: 'knight',
  2: 'thief',
  3: 'archer',
  4: 'priest',
  5: 'wizard',
  6: 'monk',
  7: 'pirate',
  8: 'berserker',
  9: 'seer',
  16: 'paladin',
  17: 'darkKnight',
  18: 'summoner',
  19: 'ninja',
  20: 'shapeshifter',
  24: 'dragoon',
  25: 'sage',
  28: 'dreadKnight'
} as const

export const genders = {
  1: 'male',
  3: 'female'
} as const
export const gendersValues = Object.values(genders)

export const professions = {
  0: 'mining',
  2: 'gardening',
  4: 'fishing',
  6: 'foraging'
} as const
export const professionsValues = Object.values(professions)

export const backgrounds = {
  0: 'desert',
  2: 'forest',
  4: 'plains',
  6: 'island',
  8: 'swamp',
  10: 'mountains',
  12: 'city',
  14: 'arctic'
} as const
export const backgroundsValues = Object.values(backgrounds)

export const statBoosts = {
  0: 'STR',
  2: 'AGI',
  4: 'INT',
  6: 'WIS',
  8: 'LCK',
  10: 'VIT',
  12: 'END',
  14: 'DEX'
} as const

export const elements = {
  0: 'fire',
  2: 'water',
  4: 'earth',
  6: 'wind',
  8: 'lightning',
  10: 'ice',
  12: 'light',
  14: 'dark'
} as const
export const elementsValues = Object.values(elements)

const skinColors = {
  0: 'c58135',
  2: 'f1ca9e',
  4: '985e1c',
  6: '57340c',
  8: 'e6a861',
  10: '7b4a11',
  12: 'e5ac91',
  14: 'aa5c38'
} as const

const hairColors = {
  0: 'ab9159',
  1: 'af3853',
  2: '578761',
  3: '068483',
  4: '48321e',
  5: '66489e',
  6: 'ca93a7',
  7: '62a7e6',
  8: 'c34b1e',
  9: '326988',
  16: 'd7bc65',
  17: '9b68ab',
  18: '8d6b3a',
  19: '566377',
  20: '275435',
  24: '880016',
  25: '353132',
  28: '8f9bb3'
} as const

const eyeColors = {
  0: '203997',
  2: '896693',
  4: 'bb3f55',
  6: '0d7634',
  8: '8d7136',
  10: '613d8a',
  12: '2494a2',
  14: 'a41e12'
} as const

const appendageColors = {
  0: 'c5bfa7',
  1: 'a88b47',
  2: '58381e',
  3: '566f7d',
  4: '2a386d',
  5: '3f2e40',
  6: '830e18',
  7: '6f3a3c',
  8: 'cddef0',
  9: 'df7126',
  16: '6b173c',
  17: 'a0304d',
  18: '78547c',
  19: '352a51',
  20: '147256',
  24: 'c29d35',
  25: '211f1f',
  28: 'd7d7d7'
} as const

const backAppendageColors = {
  0: 'c5bfa7',
  1: 'a88b47',
  2: '58381e',
  3: '566f7d',
  4: '2a386d',
  5: '3f2e40',
  6: '830e18',
  7: '6f3a3c',
  8: 'cddef0',
  9: 'df7126',
  16: '6b173c',
  17: 'a0304d',
  18: '78547c',
  19: '352a51',
  20: '147256',
  24: 'c29d35',
  25: '211f1f',
  28: 'd7d7d7'
} as const

const traits = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  19: 19,
  20: 20,
  21: 21,
  22: 22,
  23: 23,
  24: 24,
  25: 25,
  26: 26,
  27: 27,
  28: 28,
  29: 29,
  30: 30,
  31: 31
} as const

const attacks = {
  0: 'Basic1',
  1: 'Basic2',
  2: 'Basic3',
  3: 'Basic4',
  4: 'Basic5',
  5: 'Basic6',
  6: 'Basic7',
  7: 'Basic8',
  8: 'Basic9',
  9: 'Basic10',
  16: 'Advanced1',
  17: 'Advanced2',
  18: 'Advanced3',
  19: 'Advanced4',
  20: 'Advanced5',
  24: 'Elite1',
  25: 'Elite2',
  28: 'Transcendent1'
} as const

export const choices: { [index: string]: any } = {
  gender: genders,
  background: backgrounds,
  class: classes,
  classR1: classes,
  classR2: classes,
  classR3: classes,
  skinColor: skinColors,
  hairColor: hairColors,
  eyeColor: eyeColors,
  appendageColor: appendageColors,
  backAppendageColor: backAppendageColors,
  hairStyle: traits,
  backAppendage: traits,
  headAppendage: traits,
  subClass: classes,
  subClassR1: classes,
  subClassR2: classes,
  subClassR3: classes,
  profession: professions,
  passive1: attacks,
  passive2: attacks,
  active1: attacks,
  active2: attacks,
  statBoost1: statBoosts,
  statBoost2: statBoosts,
  element: elements,
  visualUnknown1: traits,
  visualUnknown2: traits,
  statsUnknown1: traits,
  statsUnknown2: traits
}

const allField = ['all', true]
export const availableClasses: string[] = [
  ...basicClasses,
  ...advancedClasses,
  ...eliteClasses,
  ...exaltedClasses
].sort()
interface ValueMap {
  [key: string]: boolean | undefined
}
const heroClassesDefault: ValueMap = Object.fromEntries([
  allField,
  ...availableClasses.map(heroClass => [heroClass, false])
])
const elementsDefault: ValueMap = Object.fromEntries([allField, ...elementsValues.map(element => [element, false])])
const backgroundsDefault: ValueMap = Object.fromEntries([
  allField,
  ...backgroundsValues.map(background => [background, false])
])
const professionsDefault: ValueMap = Object.fromEntries([
  allField,
  ...professionsValues.map(profession => [profession, false])
])
const statusDefault: ValueMap = Object.fromEntries([allField, ...statuses.map(status => [status, false])])
const genderDefault: ValueMap = Object.fromEntries([allField, ...gendersValues.map(gender => [gender, false])])
const shinyDefault: ValueMap = Object.fromEntries([allField, ...shiny.map(shiny => [shiny, false])])

const statBonusDefault: ValueMap = Object.fromEntries([allField, ...statBonusValues.map(bonus => [bonus, false])])
const statGrowthBonusDefault = ''

export const genMarks = [...Array(12).keys()].map(k => ({ value: k, label: `${k}` }))
export const summonsMarks = [...Array(11).keys()].map(k => ({ value: k, label: `${k}` }))
export const levelMarks = [...Array(11).keys()].map(k => ({ value: k * 10, label: `${k * 10}` }))
export const rarityMarks = [
  {
    value: 0,
    stringValue: 'common',
    label: 'Common'
  },
  {
    value: 1,
    stringValue: 'uncommon',
    label: 'Uncommon'
  },
  {
    value: 2,
    stringValue: 'rare',
    label: 'Rare'
  },
  {
    value: 3,
    stringValue: 'legendary',
    label: 'Legendary'
  },
  {
    value: 4,
    stringValue: 'mythic',
    label: 'Mythic'
  }
]

export const defaultHeroFilters = {
  basic: {
    id: '',
    status: statusDefault,
    price: [0, 9999999], // max price
    heroClasses: heroClassesDefault,
    heroSubClasses: heroClassesDefault,
    gender: genderDefault,
    shiny: shinyDefault,
    summonsRemaining: [0, 10],
    rarity: [0, 4],
    generation: [0, 11],
    level: [1, 100]
  },
  attributes: {
    professions: professionsDefault,
    statBoost1: statBonusDefault,
    statBoost2: statBonusDefault,
    statGrowthBonus: statGrowthBonusDefault,
    backgrounds: backgroundsDefault,
    elements: elementsDefault
  },
  stats: {
    stats: {
      hp: [0, 9999],
      mp: [0, 9999],
      stamina: [0, 9999],
      strength: [0, 9999],
      intelligence: [0, 9999],
      wisdom: [0, 9999],
      luck: [0, 9999],
      agility: [0, 9999],
      vitality: [0, 9999],
      endurance: [0, 9999],
      dexterity: [0, 9999]
    },
    skills: {
      fishing: [0, 9999],
      foraging: [0, 9999],
      gardening: [0, 9999],
      mining: [0, 9999]
    }
  }
}

export const CARDS_PER_PAGE = 100

export const CV_STARTING_HERO_ID = 1000000000000
