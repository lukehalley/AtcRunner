import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { itemMap } from 'features/items/constants'
import { ItemKeys } from 'features/items/types'
import blessing1Base from './images/blessing_1_frame.png'
import blessing1Banner from './images/blessing_1_ribbon.png'
import blessing2Base from './images/blessing_2_frame.png'
import blessing2Banner from './images/blessing_2_ribbon.png'
import blessing3Base from './images/blessing_3_frame.png'
import blessing3Banner from './images/blessing_3_ribbon.png'
import blueActive from './images/blue_egg.png'
import blueInactive from './images/blue_egg_inactive.png'
import blueLocked from './images/blue_egg_locked.png'
import goldActive from './images/gold_egg.png'
import goldInactive from './images/gold_egg_inactive.png'
import goldLocked from './images/gold_egg_locked.png'
import greenActive from './images/green_egg.png'
import greenInactive from './images/green_egg_inactive.png'
import greenLocked from './images/green_egg_locked.png'
import greyActive from './images/grey_egg.png'
import greyInactive from './images/grey_egg_inactive.png'
import greyLocked from './images/grey_egg_locked.png'
import yellowActive from './images/yellow_egg.png'
import yellowInactive from './images/yellow_egg_inactive.png'
import yellowLocked from './images/yellow_egg_locked.png'
import {
  Creators,
  CreditMap,
  EggSelect,
  EggType,
  FamilyType,
  FilterMap,
  OfferingSelect,
  Request,
  SkillBonus,
  ValueMap
} from './types'

export const PET_CORE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xAC9AFb5900C8A27B766bCad3A37423DC0F4C22d3',
  [ChainId.HARMONY_TESTNET]: '0x63F0AFcb278fD6A1f8A9Fa679880f22B580B18D2',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const PET_HATCHING_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x576C260513204392F0eC0bc865450872025CB1cA',
  [ChainId.HARMONY_TESTNET]: '0x1263B2a59F17b829D2a53d18a2f459EB77f6801c',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const PET_AUCTION_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x72F860bF73ffa3FC42B97BbcF43Ae80280CFcdc3',
  [ChainId.HARMONY_TESTNET]: '0x13A757e733535B1827dBD6Aa9E9B6D51B1578B69',
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const REQUEST: Request = {
  pets: {
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_pets',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.DFK_MAINNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
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
    [ChainId.HARMONY_MAINNET]: 'https://us-central1-defi-kingdoms-api.cloudfunctions.net/query_pets',
    [ChainId.HARMONY_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.AVALANCHE_C_CHAIN]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.AVALANCE_FUJI_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.DFK_MAINNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
    [ChainId.DFK_TESTNET]: 'https://us-central1-dfktest-1d7ce.cloudfunctions.net/query_pets',
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

export const eggSelections: EggSelect[] = [
  {
    item: itemMap[ItemKeys.PET_EGG_BLUE],
    images: {
      active: blueActive,
      inactive: blueInactive,
      locked: blueLocked
    },
    cost: [
      { item: ItemKeys.LANTERNEYE, quantity: 50 },
      { item: ItemKeys.IRONSCALE, quantity: 50 }
    ],
    eggTypeIndex: EggType.BLUE
  },
  {
    item: itemMap[ItemKeys.PET_EGG_GREY],
    images: {
      active: greyActive,
      inactive: greyInactive,
      locked: greyLocked
    },
    cost: [
      { item: ItemKeys.ROCKROOT, quantity: 45 },
      { item: ItemKeys.DARKWEED, quantity: 35 }
    ],
    eggTypeIndex: EggType.GREY
  },
  {
    item: itemMap[ItemKeys.PET_EGG_YELLOW],
    images: {
      active: yellowActive,
      inactive: yellowInactive,
      locked: yellowLocked
    },
    locked: true,
    cost: [
      { item: ItemKeys.AMBERTAFFY, quantity: 25 },
      { item: ItemKeys.SAILFISH, quantity: 10 }
    ],
    eggTypeIndex: EggType.GREY
  },
  {
    item: itemMap[ItemKeys.PET_EGG_GREEN],
    images: {
      active: greenActive,
      inactive: greenInactive,
      locked: greenLocked
    },
    locked: true,
    cost: [
      { item: ItemKeys.SPIDER_FRUIT, quantity: 15 },
      { item: ItemKeys.BLUESTEM, quantity: 30 }
    ],
    eggTypeIndex: EggType.GREY
  },
  {
    item: itemMap[ItemKeys.PET_EGG_GOLDEN],
    images: {
      active: goldActive,
      inactive: goldInactive,
      locked: goldLocked
    },
    locked: true,
    cost: [
      { item: ItemKeys.MILKWEED, quantity: 15 },
      { item: ItemKeys.SWIFT_THISTLE, quantity: 5 }
    ],
    eggTypeIndex: EggType.GREY
  }
]

export const offeringSelections: OfferingSelect[] = [
  {
    tierIndex: 0,
    baseImage: blessing1Base,
    bannerImage: blessing1Banner,
    name: 'Gaia’s Favor',
    cost: [
      { item: ItemKeys.JEWEL_BAG, quantity: 1 },
      { item: ItemKeys.GOLD_PILE, quantity: 50 },
      { item: ItemKeys.GAIASTEARS, quantity: 200 }
    ],
    incubationTime: '168 hours',
    shinyChance: '1%',
    rarityChances: [
      {
        rarity: 'Common',
        chance: '58.3%'
      },
      {
        rarity: 'Uncommon',
        chance: '27%'
      },
      {
        rarity: 'Rare',
        chance: '12.5%'
      },
      {
        rarity: 'Legendary',
        chance: '2%'
      },
      {
        rarity: 'Mythic',
        chance: '0.2%'
      }
    ]
  },
  {
    tierIndex: 1,
    baseImage: blessing2Base,
    bannerImage: blessing2Banner,
    name: 'Gaia’s Grace',
    description: '5x chance for mythic<br />7x shorter incubation time<br />10x shiny chance',
    cost: [
      { item: ItemKeys.JEWEL_BAG, quantity: 10 },
      { item: ItemKeys.GOLD_PILE, quantity: 500 },
      { item: ItemKeys.GAIASTEARS, quantity: 200 }
    ],
    incubationTime: '24 hours',
    shinyChance: '10%',
    rarityChances: [
      {
        rarity: 'Common',
        chance: '50%'
      },
      {
        rarity: 'Uncommon',
        chance: '30%'
      },
      {
        rarity: 'Rare',
        chance: '15%'
      },
      {
        rarity: 'Legendary',
        chance: '4%'
      },
      {
        rarity: 'Mythic',
        chance: '1%'
      }
    ]
  },
  {
    tierIndex: 2,
    baseImage: blessing3Base,
    bannerImage: blessing3Banner,
    name: 'Gaia’s Boon',
    description: '10x chance for mythic<br />Instant incubation<br />Guaranteed shiny',
    cost: [
      { item: ItemKeys.JEWEL_BAG, quantity: 50 },
      { item: ItemKeys.GOLD_PILE, quantity: 5000 },
      { item: ItemKeys.GAIASTEARS, quantity: 200 }
    ],
    incubationTime: '20 seconds',
    shinyChance: '100%',
    rarityChances: [
      {
        rarity: 'Common',
        chance: '36%'
      },
      {
        rarity: 'Uncommon',
        chance: '36%'
      },
      {
        rarity: 'Rare',
        chance: '20%'
      },
      {
        rarity: 'Legendary',
        chance: '6%'
      },
      {
        rarity: 'Mythic',
        chance: '2%'
      }
    ]
  }
]

export const gatheringOptions = [
  {
    label: 'Mining',
    value: 'mining'
  },
  {
    label: 'Fishing',
    value: 'fishing'
  },
  {
    label: 'Gardening',
    value: 'gardening'
  },
  {
    label: 'Foraging',
    value: 'foraging'
  }
]

export const craftingOptions = [
  {
    label: 'Leatherwork',
    value: 'leatherwork'
  },
  {
    label: 'Tailoring',
    value: 'tailoring'
  },
  {
    label: 'Blacksmithing',
    value: 'blacksmithing'
  },
  {
    label: 'Woodwork',
    value: 'woodwork'
  },
  {
    label: 'Armor',
    value: 'armor'
  }
]

export const otherOptions = [
  {
    label: 'Combat',
    value: 'combat'
  }
]

export const statusOptions = [
  {
    label: 'For Sale',
    value: 'forSale'
  },
  {
    label: 'Not for sale',
    value: 'notForSale'
  }
]

export const sortOptions = [
  {
    label: 'ID',
    value: 'id'
  },
  {
    label: 'Rarity',
    value: 'rarity'
  },
  {
    label: 'Price',
    value: 'saleprice'
  }
]

export const sortOrderOptions = [
  {
    label: 'Ascending',
    value: 'asc'
  },
  {
    label: 'Descending',
    value: 'desc'
  }
]

export const craftingByElement = [
  'blacksmithing',
  'goldsmithing',
  'armorsmithing',
  'woodworking',
  'leatherworking',
  'tailoring'
]
export const skillsByEggType = ['fishing', 'foraging', 'mining', 'gardening', 'gold']
export const gathering = ['mining', 'fishing', 'gardening', 'foraging']
export const combat = ['combat']
export const shiny = ['yes', 'no']
export const statuses = ['for_sale']
const allField = ['all', true]

const combatDefault: ValueMap = Object.fromEntries([allField, ...combat.map(key => [key, false])])
const craftingDefault: ValueMap = Object.fromEntries([allField, ...craftingByElement.map(key => [key, false])])
const gatheringDefault: ValueMap = Object.fromEntries([allField, ...gathering.map(key => [key, false])])
const shinyDefault: ValueMap = Object.fromEntries([allField, ...shiny.map(key => [key, false])])
const statusDefault: ValueMap = Object.fromEntries([allField, ...statuses.map(key => [key, false])])

export const defaultPetFilters: FilterMap = {
  basic: {
    id: '',
    bonusCount: [1, 3],
    price: [0, 9999999], // max price
    rarity: [0, 4],
    combat: combatDefault,
    crafting: craftingDefault,
    gathering: gatheringDefault,
    status: statusDefault,
    shiny: shinyDefault
  }
}

export const CARDS_PER_PAGE = 100

export const creditsMap: CreditMap = {
  [Creators.ANONYMOUS]: {
    name: 'anonymous'
  },
  [Creators.FEZZ]: {
    name: '@0xFezz',
    link: 'https://twitter.com/0xFezz'
  },
  [Creators.ATLAS]: {
    name: '@atlasprkr',
    link: 'https://twitter.com/atlasprkr'
  },
  [Creators.SECONDBESTDAD]: {
    name: '@SecondBestDad',
    link: 'https://twitter.com/SecondBestDad'
  }
}

export const backgroundsMap = [
  {
    name: 'Stillwood Meadow',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Forest Trail',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Swamp of Eoxis',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Vithraven Outskirts',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Path of Fire',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Reyalin Mountain Pass',
    credit: creditsMap[Creators.ATLAS]
  },
  {
    name: 'Adelyn Side Street',
    credit: creditsMap[Creators.ANONYMOUS]
  },
  {
    name: 'Bloater Falls',
    credit: creditsMap[Creators.SECONDBESTDAD]
  },
  {
    name: 'Haywood Farmstead',
    credit: creditsMap[Creators.ATLAS]
  },
  {
    name: 'Inner Grove',
    credit: creditsMap[Creators.FEZZ]
  },
  {
    name: 'Vuhlmira Ruins',
    credit: creditsMap[Creators.SECONDBESTDAD]
  }
]

export const cardEnvironments = [
  'plains',
  'forest',
  'swamp',
  'ice',
  'lava',
  'cliff',
  'town',
  'waterfall',
  'farm',
  'grove',
  'skycastle'
]

export const skillBonusMapping = {
  [SkillBonus.ONE]: 1,
  [SkillBonus.TWO]: 2,
  [SkillBonus.THREE]: 3
}

export const familyDescriptionMap = {
  [FamilyType.AXOLOTLS]:
    '<p>Axolotls were generally peaceful creatures with little influence on the world, but then the togwas took note of their regenerating limbs. Imprisoning them by the thousands, they were used as a sustainable food source when the hunting seasons were light.</p><p>The togwas’ capabilities have expanded in recent years, and the need to use axolotl limbs as food has passed. Yet the perceived value remains, as togwas use them as living currency.</p><p>While few traders outside the tribes will accept them as a form of payment, occasionally, these creatures make it into the larger society. These pet axolotls may not know true freedom, but they have at least escaped being crammed into money bags.</p>',
  [FamilyType.BASILISKS]:
    '<p>Basilisks are armored monstrosities descended from the dragon family and became well-known nuisances when the first Adelynians began crossing Dranglin Pass. Their claws and razor-sharp teeth tore through armor crafted by the finest blacksmiths.</p><p>Once it was learned their rage could be tamed at an early age, their eggs became highly valuable amongst warlords who now use them as guardians.</p>',
  [FamilyType.BLOATERS]:
    '<p>The humble but sturdy bloater.</p><p>Known for its docile beauty and majestic demeanor, this fish can inflate at will. Typically this skill is used to intimidate predators in the wild, but those domesticated use it to fill space temporarily.</p><p>Need to plug a leak? A bloater will do. Need to keep a door open? The bloater will diligently perform its duty. They remain practical and reliable companions as long as they are not left alone too long.</p>',
  [FamilyType.BLUBS]:
    '<p>A nuisance with origins covered in shadow, the blubs are a recent plague to emerge across the lands of Serendale.</p><p>Their young invade eggs and assimilate with their hosts, which has raised alarming concerns among Adelyn and its neighboring kingdoms. Thankfully, the process has been slow but could pose detrimental effects to the ecosystem in the future if not watched carefully.</p><p>Once hatched, they become harmless. Their cute beady eyes have won over the general populace, resulting in many calling them companions.</p>',
  [FamilyType.BOARS]:
    '<p>The noble boar is found throughout Gaia, often rolling in the mud or huffing about deep in the woods.</p><p>Skilled breeders often breed domesticated boars in the realm of Haywood. An annual competition, to coincide with the harvest season, has been held there since before the founding of Adelyn.</p><p>Rarely, a boar may exhibit a trait that endows them with a keen sense of smell for things that grow beneath the surface, making them apt foraging companions.</p>',
  [FamilyType.CAEDORIS]:
    '<p>Caedoris are trickster spirits who hide in the crevices of the world. When one is near, you can hear them chattering happily in tongues long-forgotten by the living.</p><p>Those who fear them say they speak with the Nameless One. Yet occasionally, children who get lost in the woods claim to have been guided home by the light of their lanterns.</p><p>Being a caedori’s caretaker can be an anxious experience due to their unclear intentions. However, there’s no evidence that they mean any harm to humans.</p><p>Legends tell of a caedori who came across Dyan, the God of Craftsmanship and Wisdom, who upon hearing the caedori’s tale, crafted the spirit a hat of pure crystal. It is thought that the god has a habit of giving gifts to caedori whenever he visits the mortal plane, preferring their company to that of people.</p>',
  [FamilyType.CERBERUS]:
    '<p>They say that all good things come in threes, and heads are no exception. Though their origins are unclear, legend has it that the dwarves uncovered the first Cerberus while digging deep into the earth.</p><p>In their quest for gems, they stumbled onto a large underground river. At the edge resided a large stone door, at the foot of which laid a monstrously large three-headed dog, who had fallen sick. When the dwarves noticed the beast was on the nigh unto whelping, they tended to its needs, bringing it food and drink while delivering its many pups. Sadly, the creature did not survive.</p><p>The dwarves took it upon themselves to raise the cerberus pups as their own. As they grew, many returned to the wild. But a few remained bonded with the dwarves, becoming the first cerebrus pets on record.</p>',
  [FamilyType.CLAMS]:
    '<p>Hardy little creatures, clams come in all shapes and sizes. The smaller ones are often farmed from the rocky shores, where they’re sent to the dinner table as appetizers. But occasionally, one will hold a pearl that can be sold on the market for a hefty price.</p><p>Some of these clams are buried much deeper and are harder to reach, resulting in them spending extended time underground, expanding their size. These larger creatures are not sought for food but as prized companions who are resilient against the elements.</p><p>It has been rumored that these larger clams may sometimes produce jewels in the same manner as pearls, but there has been no evidence to confirm this.</p>',
  [FamilyType.CORGIS]:
    '<p>Short, stout, and the goodest of all pups. Corgis are loyal companions who wish to bring nothing but happiness to their owners.</p><p>Long ago, they were viewed as less than capable and often were abandoned. But legends spread that the gods sent them to offer companionship to orphans. Now they have become beloved pets for families with children, though their energetic nature can sometimes lead to "accidents".</p>',
  [FamilyType.CRABS]:
    '<p>Crabs are one of the most prolific aquatic creatures, with dense populations in both the warm oceans of Serendale and the frigid waters of Crystalvale.</p><p>Scholars believe they were initially soft and defenseless, acting as servants to the Krakens who protected them.</p><p>As they evolved, their hard shells, sharp pincers, and regenerating abilities made them self-sufficient and capable of relying on a community of crustaceans without an overseer. Even with their newfound independence, their servile nature remains, showing loyalty to anyone who becomes their owner.</p>',
  [FamilyType.DRAGONFLIES]:
    '<p>Swift, cunning, and flexible, the dragonflies were the aces of the skies in the insect world throughout the years, approaching the size of small dragons.</p><p>Fortunately, they are much too little for their mandibles to do any damage in the modern-day, though they are still quite aggressive, frequently biting at their owners.</p><p>Most are willing to put up with the occasional nibble as they view dragonflies as a sign of good luck bestowed by Gaia.</p>',
  [FamilyType.DRAGONLINGS]: '',
  [FamilyType.EMBERLINGS]:
    '<p>Originating from the frozen lands of Crystalvale, emberlings are birthed from the fallen leaves of Skaddrissale. Their flame-like bodies pose no harm to the environment or those who handle them.</p><p>It’s rumored among the citizens of Vithraven that emberlings are the souls of the ancestors reincarnated as playful spirits, offering comfort to their descendants and warding off evil spirits.</p>',
  [FamilyType.ENTS]:
    '<p>Though bearing striking similarities to their cousins found worldwide, ents are mobile creatures with an insatiable curiosity about their surroundings and beyond.</p><p>Their travels eventually cross paths with others who choose to tag along as coveted companions. However, because of the extensive lifespan of ents, they will likely see many companions fade into dust, taking the wisdom and experiences from each one for the day they may become a great ent.</p>',
  [FamilyType.FAE]:
    '<p>The Elder Spriggan spun off great acorns in its dying moments, giving rise to lesser spriggans. These smaller trees dropped acorns, which birthed fae to protect themselves from a dangerous and ever-changing world.</p><p>Fae are ageless, yet mortal, beings who owe their power to their mother spriggan. Each spriggan has its own tribe of fae, which protect it with utter ferocity. When a fae loses its mother, they will seek a new companion to entrust themselves.</p><p>Legends tell of a group of wayward fae who wandered Gaia for many years after their spriggan was slain in battle. It is thought that these sprigganless fae entered into the service of Suneria, the Goddess of Light, where they found a new eternal home.</p>',
  [FamilyType.DEER]:
    '<p>Roaming the forests across the realm of Gaia, deer are one of the oldest creations that persevered through several world-changing events such as the Titan Wars and Sundering. Their agile bodies help them to outrun threats while their beautiful display of antlers pummels through small foes.</p><p>In a peaceful environment, deer are docile. They graze on greenery in peace, though they prefer company. Lone deer may form a bond with a companion merely due to their prolonged presence. It’s not uncommon for them to follow a family home from a picnic.</p><p>If a young fawn forms a bond with its caretaker, being separated causes them to collapse to the ground and remain completely motionless. Once reunited, the fawn springs back to life.</p>',
  [FamilyType.FISH]:
    '<p>Fish have been roaming the waters since ancient times, with an extensive evolutionary tree that has resulted in one of the most diverse populations in the world.</p><p>These creatures are fished up mainly as a food source, though it has not stopped some residents from relocating them to ponds behind their homes.</p><p>Even with their new cramped environment, the fish swim around happily in a circle as if nothing has changed.</p>',
  [FamilyType.FROGS]:
    '<p>Frogs are creatures who change with the seasons. Their mucus-covered skin lets them dart about bodies of water, but as the temperature drops, the slimy film begins to harden—nearly halting their movement.</p><p>As the days warm, they begin to sing out in jubilation of their returned freedom. Showmen used to abuse this trait by artificially freezing frogs, then heating them for musical performances.</p><p>Though regulations have stopped this practice, these shows significantly improved the desirability of frogs as companions.</p>',
  [FamilyType.GAERON_WHELPS]:
    '<p>Small yet pudgy, the gaeron whelps have an immense appetite. No matter what is put in front of them, they’ll try to consume it. Looters will frequently search their remains in hopes of finding undigested treasures, including various crystals, gems, and precious metals.</p><p>When domesticated, gaeron whelps are often kept isolated, else the owner risks rips, tears, and bite marks on anything in mouth’s reach.</p>',
  [FamilyType.GEESE]:
    '<p>Displaying a variety of colors among their flock, geese are some of the most unique members of the avian family.</p><p>Despite their docile appearance, they are known to pack quite a peck and are notorious for their mischievous behavior. They steal shoes and any other small items they can get their bills on, making them great companions for petty thieves.</p><p>Legends tell of a mysterious Golden Goose, whom some higher power has blessed for unknown intents and purposes. Let’s hope its golden wrath isn’t set upon us.</p>',
  [FamilyType.HECHUS]:
    '<p>All across Serandale, wily hechus can be found scurrying about. Farmers and gardeners alike often shoo them away as pests, for they are known to carry off copious amounts of food in their cheek pouches.</p><p>Some do claim to keep hechus as pets. However, it is uncertain if they can be truly tamed. If they catch a whiff of food in the distance, they will immediately abandon their owner.</p>',
  [FamilyType.HIGHLANDS_WHELPS]:
    '<p>Found among the Adelyn Highlands, it is believed these whelps are descendants of the dragons that once ruled the Limera Mountainside, now known as Dranglin Peaks.</p><p>Ancient texts show that the Drythenian Empire once had individuals who possessed the ability to communicate with these incredible creatures. It appears you’re one of the lucky ones.</p><p>While dragons are known to excel at hoarding wealth, they also hoard caches of their eggs. Legends tell of a hoard hidden deep within the woods of the Adelyn Highlands, laid there by an ancient dragon of the Drythenian Empire who lost her rider.</p>',
  [FamilyType.HYDRAS]:
    '<p>Hydras are among the earliest Blighted Ones to be crafted by the Nameless One after the Sundering, making their stamp on the world as permanent residents.</p><p>Even a band of the most experienced Heroes and Druids struggle to take down fully developed hydras. However, their offspring are capable of imprinting on their caretakers, offering a chance to use these unnatural creations for good.</p>',
  [FamilyType.LEVIATHANS]:
    '<p>"The most majestic of beings have humble of beginnings," says an old Drythenian scholar. Leviathan offspring seemingly come from the minds of their parents as they shift the soil into a new form. What precisely transforms dirt into life is one of the greatest mysteries in the world of Gaia.</p><p>To witness such a creation is incredibly rare, a display of cosmic and chaotic energy in such synchronized harmony. But to befriend one? That is most unexpected.</p>',
  [FamilyType.MERFOLK]:
    '<p>Many merfolk live together in an underwater kingdom, though some prefer lives as loners, roaming and exploring the ocean floors in solitude.</p><p>Though do not mistake them for shy creatures -- frequently they surface to chat with sailors and fishermen. Rarely will one ever find a terrestrial companion; however, those who establish a bond tend to keep their merfolk at a distance.</p><p>There are many accounts of merfolk attempting to gently pull their owner from their beds in the middle of the night and into the ocean. Few succeed, but heavy sleepers should beware. Anyone dragged into the depths becomes merfolk themselves, the legends say.</p>',
  [FamilyType.MOSSFOLK]:
    '<p>Mossfolk spread life throughout the land, carrying pollen and seeds in the plant-like hairs on their backs. Small animals and insects will take up residency on them, making them mobile ecosystems. The plant matter can also act as a protective layer from predators.</p><p>Mossfolk have an immense fear of open flames; few can put out a fire on their back without the help of others.</p><p>Unlike the mossfolk’s more aggressive cousins known as mossmen, they have a welcoming presence and retain the tame features the Druids imbued into them long ago. Many ranchers will set out large piles of fruit to draw them in to help maintain a healthy layer of grass across their fields.</p>',
  [FamilyType.PENGUINS]:
    '<p>Native to Crystalvale, penguins have one goal: to consume fish.</p><p>The birds were so plentiful and troublesome that the locals attempted to turn the problem into the solution by training them to catch and release into a bucket. However, no incentive could stop penguins from guzzling the fish whole.</p><p>While society has given up utilizing them for fishing, the penguins became quite fond of people. Now, when they’re not stuffing their gullets, they will waddle behind the feet of others on the dock.</p>',
  [FamilyType.PET_ROCKS]:
    '<p>This is a pet rock. Is it a friend? Perhaps a rival? Or maybe family? As long as the owner believes in this companion wholeheartedly, it can be anything. Those who form this bond will feel a strength they never knew.</p><p>Though everyone else knows that it’s just a rock.</p>',
  [FamilyType.RIVERHOLD_WHELPS]:
    '<p>Found among the Adelyn Highlands, it is believed these whelps are descendants of the dragons that once ruled the Limera Mountainside, now known as Dranglin Peaks.</p><p>Ancient texts show that the Drythenian Empire once had individuals who possessed the ability to communicate with these incredible creatures. It appears you’re one of the lucky ones.</p><p>While dragons are known to excel at hoarding wealth, they also hoard caches of their eggs. Legends tell of an ancient dragon of the Drythenian Empire whose hoard was swept downstream by a powerful river current.</p><p>Some theorize that the Keep of Riverhold was built on the very spot where these eggs were found, though this is only a tale. Still, visitors to Riverhold often claim to hear the cries of young dragons, piercing through the stones of the old keep.</p>',
  [FamilyType.SHRUBBLERS]:
    '<p>Shrubblers, sometimes derogatorily called "bush goblins",  are mysterious creatures that are difficult to spot and even harder to catch. Their nickname comes from a popular children’s tale in which a goblin who, to steal from an ogre, covers himself with Redleaf only to find that he can no longer remove them.</p><p>Wild shrubblers are loathed by gardeners because of their penchant for mischief. But when domesticated, they can be helpful foraging allies, as they possess considerable knowledge of flora.</p>',
  [FamilyType.SNAILS]:
    '<p>Tiny and slimy—snails are some of the slowest creatures in the world.</p><p>Their origins come from slugs who served a thaumaturge, gathering ingredients for him. After much abuse, they abandoned their owner, who cast a curse on them in retaliation. Their descendants carry the burden of a large, heavy shell on their back.</p><p>Far from being detested, the upper societies place much value on snails. Many believe their mucus has rejuvenating properties, helping reduce the wrinkles on one’s skin. The proper treatment is as follows: before going to sleep, a snail owner places leaves all over themselves. The snail slowly moves across their skin throughout the night, laying its slimy tracks and munching on dinner.</p>',
  [FamilyType.SNOWMEN]:
    '<p>It’s a winter tradition among the children of Serendale to build a snowman as a companion for the season.</p><p>They say their farewells when the temperature rises and their icy friend slowly melts away. However, there has been a strange occurrence as of late. The once still snowmen have begun to move in a peculiar, jelly-like fashion. They even have started to survive the most sweltering of summers. While parents worry, children celebrate their new long-term playmates.</p>',
  [FamilyType.STARFISH]:
    '<p>Found along coastal shores worldwide, the starfish is a friendly creature that enjoys being held by those who carry a gentle heart.</p><p>If their owner shows signs of loneliness, smaller starfish will re-assure them by wrapping their arms around their fingers, while larger starfish will give full hugs.</p>',
  [FamilyType.STARLIGHT_BUTTERFLIES]:
    '<p>Starlight butterflies are a rare sight in Crystalvale; their name derives from the fact that they emerge from their chrysalis under the star-filled light of the new moon.</p><p>A few citizens of Vithraven have domesticated them as the butterflies’ primary food sources are insects and pests harmful to crops.</p><p>Those most successful at this hunting process are known to grow quite large. Each year, a competition is held in Vithraven to see who has the largest butterfly.</p>',
  [FamilyType.TENTICKLERS]:
    '<p>Tenticklers are slimy little creatures that can be found playing about in the sea, though most citizens know of them from the onshore farms.</p><p>They are kept in small submerged cages where they are forced to expel ink. This liquid is a valuable asset to modern society, as written records and memos drive most business and government operations.</p><p>Rarely do they receive love or affection in these facilities, so when they are re-homed to a loving companion, the tenticklers show their appreciation by showering their owner with kisses.</p>',
  [FamilyType.TOADS]:
    '<p>Other than their gargantuan size, giant toads are no different than their smaller counterparts. What sets them apart is where their eggs are laid; pools of water brimming with mana infuse the eggs with energy, causing excessive growth.</p><p>Even when domesticated, it is recommended to keep children and small animals away from giant toads. In the blink of an eye, the toad may nab them up.</p>',
  [FamilyType.TOGWAS]:
    '<p>Togwas are not known for being courageous or loyal creatures. If their survival is at risk, they will even abandon their children, leaving whole nests of eggs behind.</p><p>This is becoming a more common occurrence with both the increased presence of the Blighted Ones and the kingdom’s expansion putting their homes at more significant risk.</p><p>The young that are fortunate enough to survive take shelter among others who pose good intentions. This sense of abandonment has taught these offspring to be a better example, showing undying loyalty to their companions.</p>',
  [FamilyType.TURTLES]:
    '<p>Turtles are blessed with hard shells that fend off primitive predators who use brute force to try to consume them. That same durable trait makes them the target of intelligent creatures, who use their shells as material.</p><p>Due to the immense number of poaching incidents and a steady population decline, a society was founded to bring turtles ashore into safe habitats. Their eggs are then distributed amongst trusted volunteers who wish to raise them.</p>',
  [FamilyType.WARLOCTOPUS_AND_SQUID_ORACLE]:
    '<p>Octopus and squids build their home on the seafloor, gathering any shells or hard protective material they can find. In rare cases, one may take up residence near a crevice with a flow of mana seeping out from deep below.</p><p>After some time, they will gain magical abilities and rise to the surface. Poachers look for these enhanced cephalopods who carry stave-like objects and carefully tranquilize them.</p><p>Once tamed, they follow every command of their owner.</p>',
  [FamilyType.WOLVES]:
    '<p>Wolves can be found from the snowy tundra of Crystalvale to the deep woods of the Fairling Forest.</p><p>Early in their life, they’re susceptible to mana that surrounds them. The type of mana they’re exposed to changes the traits they develop as they grow into adulthood.</p><p>Gaining the respect of a wolf is a dangerous and challenging task, though made easier if befriended as a pup. In these situations, they can become life-long companions.</p>'
}
