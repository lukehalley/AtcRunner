import { ContractReceipt } from 'ethers'
import store from 'features'
import { Gender } from 'features/heroes/types'
import { buildContractHero } from 'features/heroes/utils'
import { getItemFromAddress } from 'features/items/utils'
import { HeroStatGenes, HeroVisualGenes, Recessive } from 'utils/dfkTypes'
import { statIndexMapping } from './constants'
import { RerollEventTypes, Rewards } from './types'

export function getRecessiveLabelMapping<T>(key: string | number, value: T, gender?: Gender, isDominant?: boolean) {
  switch (key) {
    case 'class':
      return isDominant ? `-${String(value)}` : value
    case 'appendageColor':
    case 'backAppendageColor':
    case 'eyeColor':
    case 'hairColor':
    case 'skinColor':
      return `#${String(value)}`.toUpperCase()

    case 'headAppendage':
      return headAppendageNameMap[Number(value)]

    case 'backAppendage':
      return backAppendageNameMap[Number(value)]

    case 'hairStyle':
      return gender ? getRecessiveHairStyleNames(gender, Number(value)) : value

    default:
      return value
  }
}

export function getRecessiveHairStyleNames(gender: Gender, index: number) {
  const hairStyles = {
    male: [
      'Battle Hawk',
      'Wolf Mane',
      'Enchanter',
      'Wild Growth',
      'Pixel',
      'Sunrise',
      'Bouffant',
      'Agleam Spike',
      'Wayfinder',
      'Faded Topknot',
      'Gruff',
      'Rogue Locs',
      'Stone Cold',
      "Zinra's Tail",
      'Hedgehog',
      'Skegg',
      'Shinobi',
      'Perfect Form'
    ],
    female: [
      'Windswept',
      'Fauna',
      'Enchantress',
      'Pineapple Top',
      'Pixie',
      'Darkweave Plait',
      'Dejanira',
      'Courtly Updo',
      'Centaur tail',
      'Lamia',
      'Vogue Locs',
      'Twin Vine Loops',
      'Sweeping Willow'
    ]
  }
  return hairStyles[gender][index]
}

export const headAppendageNameMap = [
  'None',
  'Kitsune Ears',
  'Satyr Horns',
  'Ram Horns',
  'Imp Horns',
  'Cat Ears',
  'Minotaur Horns',
  'Faun Horns',
  'Draconic Horns',
  'Fae Circlet',
  'Jagged Horns',
  'Spindle Horns',
  'Bear Ears',
  'Antennae',
  'Fallen Angel Coronet',
  'Wood Elf Ears',
  'Snow Elf Ears',
  'Insight Jewel'
]

export const backAppendageNameMap = [
  'None',
  'Monkey Tail',
  'Cat Tail',
  'Imp Tail',
  'Minotaur Tail',
  'Daishō',
  'Kitsune Tail',
  'Zweihänder',
  'Skeletal Wings',
  'Skeletal Tail',
  'Gryphon Wings',
  'Draconic Wings',
  'Butterfly Wings',
  'Phoenix Wings',
  'Fallen Angel',
  'Aura of the Inner Grove',
  'Ancient Orbs',
  'Cecaelia Tentacles'
]

export const rerollableGenes = [
  'class',
  'subClass',
  'headAppendage',
  'appendageColor',
  'backAppendage',
  'backAppendageColor',
  'hairStyle',
  'hairColor'
] as const

export function formatGeneLabel(value: string) {
  if (value === 'appendageColor') return 'headAppendageColor'
  return value
}

export function buildRows<T>(recessives: { [index: string]: Recessive<T> }, gender?: Gender) {
  type Key = keyof typeof recessives
  const keys = Object.keys(recessives) as Key[]
  const filteredKeys = rerollableGenes.filter(g => keys.includes(g))
  return filteredKeys.map(k => ({
    genes: formatGeneLabel(k),
    d: getRecessiveLabelMapping(k, recessives[k].d, gender, true),
    r1: getRecessiveLabelMapping(k, recessives[k].r1, gender),
    r2: getRecessiveLabelMapping(k, recessives[k].r2, gender),
    r3: getRecessiveLabelMapping(k, recessives[k].r3, gender)
  }))
}

export function buildOldAndNewGeneRows<T>(
  oldRecessives: { [index: string]: Recessive<T> },
  newRecessives: { [index: string]: Recessive<T> },
  gender?: Gender
) {
  type Key = keyof typeof oldRecessives
  const keys = Object.keys(oldRecessives) as Key[]
  const filteredKeys = rerollableGenes.filter(g => keys.includes(g))
  const rows: ({ genes: string } & Recessive<any>)[] = []
  filteredKeys.forEach(k => {
    rows.push({
      genes: `Old ${formatGeneLabel(k)}`,
      d: getRecessiveLabelMapping(k, oldRecessives[k].d, gender, true),
      r1: getRecessiveLabelMapping(k, oldRecessives[k].r1, gender),
      r2: getRecessiveLabelMapping(k, oldRecessives[k].r2, gender),
      r3: getRecessiveLabelMapping(k, oldRecessives[k].r3, gender)
    })
    rows.push({
      genes: `New ${formatGeneLabel(k)}`,
      d: getRecessiveLabelMapping(k, newRecessives[k].d, gender, true),
      r1: getRecessiveLabelMapping(k, newRecessives[k].r1, gender),
      r2: getRecessiveLabelMapping(k, newRecessives[k].r2, gender),
      r3: getRecessiveLabelMapping(k, newRecessives[k].r3, gender)
    })
  })
  return rows
}

export function isStatGenes(genes: HeroStatGenes | HeroVisualGenes): genes is HeroStatGenes {
  return Object.keys((genes as HeroStatGenes).recessives).includes('class')
}

export function getRerollRewardsFromReceipt(receipt: ContractReceipt) {
  const { profile } = store.getState().profile
  const rewards = receipt.events?.reduce(
    (acc, e) => {
      const event: Rewards = { ...acc }
      if (e.event === RerollEventTypes.HeroReroll && e.args) {
        event.hero = {
          before: buildContractHero(e.args.heroBefore, profile),
          after: buildContractHero(e.args.heroAfter, profile),
          choice: e.args.choice
        }
      }
      if (e.event === RerollEventTypes.SummonsReset && e.args) {
        event.summons = {
          oldSummonCount: Number(e.args.oldSummonCount),
          newSummonCount: Number(e.args.newSummonCount)
        }
      }
      if (e.event === RerollEventTypes.RewardMinted && e.args) {
        const item = getItemFromAddress(e.args.rewardAddress)
        if (item) {
          item.quantity = Number(e.args.amount)
          event.items.push({
            item
          })
        }
      }
      if (e.event === RerollEventTypes.StatUp && e.args) {
        event.stats.push({
          stat: statIndexMapping[Number(e.args.stat)].abbr,
          increase: Number(e.args.increase)
        })
      }
      if (e.event === RerollEventTypes.XpUp && e.args) {
        event.xp = Number(e.args.increase)
      }
      return { ...acc, ...event }
    },
    { items: [], stats: [] } as Rewards
  )
  return rewards
}
