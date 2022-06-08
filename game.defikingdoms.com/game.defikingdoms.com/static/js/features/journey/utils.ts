import { ContractReceipt } from 'ethers'
import store, { dispatch } from 'features'
import {
  HERO_JOURNEY_ELEMENT_INDEX,
  HERO_JOURNEY_STAT_UP_ELIGIBLE_BIT_INDEX,
  HERO_JOURNEY_STAT_UP_USED_BIT_INDEX,
  HERO_JOURNEY_STORAGE_ID
} from 'features/flagstorage/constants'
import { getHeroById } from 'features/heroes/api'
import { removeUserHero } from 'features/heroes/state'
import { itemMap } from 'features/items/constants'
import { ItemKeys } from 'features/items/types'
import { getHeroTier } from 'features/portal/utils'
import { DateTime } from 'luxon'
import { getFlagCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import {
  crystalRewardMap,
  jewelRewardMap,
  stoneRewardMapping,
  stoneStatsAddressMapping,
  stoneStatsMapping
} from './constants'
import { setPerishedHeroesWithRewards, setStatBoostHeroes, setSurvivedHeroesWithRewards } from './state'
import { JourneyEventTypes, PerilousJourneyHeroWithRewards } from './types'

type StatObject = {
  key: string
  value: number
}

type IndexedStat = { [index: string]: number }

const getClassRank = (hero: Hero) => {
  const classCategories = ['basic', 'advanced', 'elite', 'exalted']
  const heroClassCategory = getHeroTier(hero.class)
  return classCategories.indexOf(heroClassCategory)
}

const breakStatsTie = (
  hero: Hero,
  bestObj: StatObject,
  compareObj: StatObject,
  bestStatIndex: number,
  compareIndex: number
) => {
  if (!hero.statGrowth?.primary || !hero.statGrowth?.secondary) return bestStatIndex
  let winner = bestStatIndex

  const primaryBestValue = (hero.statGrowth.primary as IndexedStat)[bestObj.key]
  const primaryCompareValue = (hero.statGrowth.primary as IndexedStat)[compareObj.key]
  const secondaryBestValue = (hero.statGrowth.secondary as IndexedStat)[bestObj.key]
  const secondaryCompareValue = (hero.statGrowth.secondary as IndexedStat)[compareObj.key]

  if (primaryBestValue < primaryCompareValue) {
    winner = compareIndex
  } else if (primaryBestValue === primaryCompareValue) {
    if (secondaryBestValue < secondaryCompareValue) {
      winner = compareIndex
    }
  }

  return winner
}

export const calculateHighestTwoStats = (hero: Hero) => {
  const statObjs: StatObject[] = [
    { key: 'strength', value: hero.stats?.strength || 0 },
    { key: 'dexterity', value: hero.stats?.dexterity || 0 },
    { key: 'agility', value: hero.stats?.agility || 0 },
    { key: 'vitality', value: hero.stats?.vitality || 0 },
    { key: 'endurance', value: hero.stats?.endurance || 0 },
    { key: 'intelligence', value: hero.stats?.intelligence || 0 },
    { key: 'wisdom', value: hero.stats?.wisdom || 0 },
    { key: 'luck', value: hero.stats?.luck || 0 }
  ]

  const highStatObjects = [statObjs[0], statObjs[0]]
  let bestStatIndex = 0

  statObjs.forEach((statObj, index) => {
    if (!statObj) return
    const bestValue = statObjs[bestStatIndex].value
    const statValue = statObj.value
    if (statValue > bestValue) {
      bestStatIndex = index
    } else if (statValue === bestValue) {
      bestStatIndex = breakStatsTie(hero, statObjs[bestStatIndex], statObj, bestStatIndex, index)
    }
  })

  highStatObjects[0] = statObjs[bestStatIndex]
  statObjs.splice(bestStatIndex, 1)
  bestStatIndex = 0

  statObjs.forEach((statObj, index) => {
    if (!statObj) return
    const bestValue = statObjs[bestStatIndex].value
    const statValue = statObj.value
    if (statValue > bestValue) {
      bestStatIndex = index
    } else if (statValue === bestValue) {
      bestStatIndex = breakStatsTie(hero, statObjs[bestStatIndex], statObj, bestStatIndex, index)
    }
  })

  highStatObjects[1] = statObjs[bestStatIndex]

  return { primary: highStatObjects[0].key, secondary: highStatObjects[1].key }
}

export const calculateSurvivalChance = (hero: Hero, genZeroCaptain: boolean) => {
  if (hero.generation === 0) {
    return 100
  }

  const baseRate = 34
  const classRank = getClassRank(hero)
  const computedRate = baseRate + hero.level + hero.rarityNum * (2 + hero.rarityNum) + 2 * classRank * (1 + classRank)

  return genZeroCaptain ? computedRate + 3 : computedRate
}

export const calculateCrystalSurvivorRewards = (hero: Hero) => {
  const rarity = hero.rarityNum
  const classRank = getClassRank(hero)
  const baseRewards = crystalRewardMap[rarity][classRank]

  return baseRewards + (hero.level - 1)
}

export const calculateJewelDeathRewards = (hero: Hero) => {
  const rarity = hero.rarityNum
  const classRank = getClassRank(hero)
  const baseRewards = jewelRewardMap[rarity][classRank]

  return baseRewards + (hero.level - 1) * 0.2
}

export const calculateGen0RaffleTickets = (hero: Hero) => {
  const classRank = getClassRank(hero)
  return hero.level + 2 * hero.rarityNum + 2 * classRank
}

export const calculateShvasRuneRewards = (hero: Hero) => {
  const level = hero.level

  if (level === 1) {
    return 0
  }

  return Math.floor(level / 2)
}

export const calculateMokshaRuneRewards = (hero: Hero) => {
  const level = hero.level

  if (level < 4) {
    return 0
  } else if (level >= 8) {
    return 2
  } else {
    return 1
  }
}

export const calculateStoneDeathRewards = (hero: Hero) => {
  const rarity = hero.rarityNum
  const classRank = getClassRank(hero)
  const stoneInfo = stoneRewardMapping[rarity][classRank]
  const highestStats = calculateHighestTwoStats(hero)

  const finalStoneStrings = stoneInfo.map(info => {
    const stoneType = info.primary ? stoneStatsMapping[highestStats.primary] : stoneStatsMapping[highestStats.secondary]
    const grade = info.grade === 'standard' ? '' : `${info.grade} `

    return `${info.quantity} ${grade}${stoneType} ${info.type}${info.quantity > 1 ? 's' : ''}`
  })

  return finalStoneStrings
}

export const calculateStoneDeathRewardItems = (hero: Hero) => {
  const rarity = hero.rarityNum
  const classRank = getClassRank(hero)
  const stoneInfo = stoneRewardMapping[rarity][classRank]
  const highestStats = calculateHighestTwoStats(hero)

  const finalStoneRewards = stoneInfo.map(info => {
    const stoneItem = info.primary
      ? stoneStatsAddressMapping[highestStats.primary][info.grade.toLowerCase()][
          info.type.toLowerCase() as 'crystal' | 'stone'
        ]
      : stoneStatsAddressMapping[highestStats.secondary][info.grade.toLowerCase()][
          info.type.toLowerCase() as 'crystal' | 'stone'
        ]

    return { item: stoneItem, quantity: info.quantity }
  })

  return finalStoneRewards
}

export const getPJStartSignupTime = () => {
  return DateTime.utc(2022, 3, 2, 19)
}

export const getPJEndSignupTime = () => {
  return DateTime.utc(2022, 3, 7, 19)
}

export const getPJStartRetrieveTime = () => {
  return DateTime.utc(2022, 3, 16, 18)
}

export const getPJEndRetrieveTime = () => {
  return DateTime.utc(2022, 3, 21, 18)
}

export const getPJStatBoostEndTime = () => {
  return DateTime.utc(2022, 4, 4, 18)
}

export const perilousJourneyStarted = () => {
  const startTime = getPJEndSignupTime()
  const currentTime = DateTime.now()

  return currentTime >= startTime
}

export const perilousJourneyEnded = () => {
  const retrieveTime = getPJStartRetrieveTime()
  const currentTime = DateTime.now()

  return currentTime >= retrieveTime
}

export const perilousJourneyClaimEnded = () => {
  const endTime = getPJEndRetrieveTime()
  const currentTime = DateTime.now()

  return currentTime >= endTime
}

export const perilousJourneyStatBoostEnded = () => {
  const endTime = getPJStatBoostEndTime()
  const currentTime = DateTime.now()

  return currentTime >= endTime
}

export const getJourneyRewardsFromReceipt = async (receipt: ContractReceipt) => {
  const heroClaimed = receipt.events?.filter(e => e.event === JourneyEventTypes.HERO_CLAIMED)

  let survivedHeroes: PerilousJourneyHeroWithRewards[] = []
  let perishedHeroes: PerilousJourneyHeroWithRewards[] = []

  if (!heroClaimed) return

  // Loop through hero claimed events and map them to the correct heroes
  for (const claimedEvent of heroClaimed) {
    const survived = claimedEvent.args?.heroSurvived
    const cleanHeroId = Number(claimedEvent.args?.heroId)
    let finalHero = null
    const { userHeroes } = store.getState().heroes
    const localHero = userHeroes.filter((hero: Hero) => Number(hero.id) === cleanHeroId)[0]

    if (typeof localHero !== 'undefined') {
      finalHero = localHero
    } else {
      try {
        const hero = await getHeroById(cleanHeroId.toString())
        if (hero.length > 0) {
          finalHero = hero[0]
        }
      } catch (error) {
        errorHandler(error)
      }
    }

    if (finalHero) {
      const finalHeroRewardsData = convertHeroToHeroWithRewards(finalHero, survived, true)

      if (survived) {
        survivedHeroes = [...survivedHeroes, finalHeroRewardsData]

        if (finalHero.generation > 0) {
          const { statBoostHeroes } = store.getState().journey
          const updatedHeroes = statBoostHeroes.concat([])
          updatedHeroes.push(finalHero)
          dispatch(setStatBoostHeroes(updatedHeroes))
        }
      } else {
        perishedHeroes = [...perishedHeroes, finalHeroRewardsData]
        dispatch(removeUserHero(finalHero.id))
      }
    }
  }

  dispatch(setSurvivedHeroesWithRewards(survivedHeroes))
  dispatch(setPerishedHeroesWithRewards(perishedHeroes))
}

export const convertHeroToHeroWithRewards = (
  heroRaw: Hero,
  survived: boolean,
  initialRewards?: boolean
): PerilousJourneyHeroWithRewards => {
  let hero = heroRaw
  const claimedDate =
    !initialRewards && heroRaw.pjclaimstamp
      ? DateTime.fromMillis(heroRaw.pjclaimstamp * 1000)
      : getPJStartRetrieveTime()
  const claimedPreDeadline = claimedDate < getPJEndRetrieveTime()

  if (heroRaw.pjlevel) {
    hero = Object.assign({}, heroRaw)
    hero.level = heroRaw.pjlevel
  }

  const stoneRewards = calculateStoneDeathRewardItems(hero)
  const runeRewards = [
    { item: itemMap[ItemKeys.SHVAS_RUNE], quantity: calculateShvasRuneRewards(hero) },
    { item: itemMap[ItemKeys.MOKSHA_RUNE], quantity: calculateMokshaRuneRewards(hero) }
  ]

  return {
    tokenQuantity:
      (survived && initialRewards && !perilousJourneyClaimEnded()) ||
      (survived && heroRaw.pjlevel && claimedPreDeadline)
        ? calculateCrystalSurvivorRewards(hero)
        : survived && !perilousJourneyClaimEnded()
        ? -1
        : calculateJewelDeathRewards(hero),
    raffleTicketQuantity: initialRewards || heroRaw.pjlevel || !survived ? calculateGen0RaffleTickets(hero) : -1,
    rewardItems: survived ? [] : [...stoneRewards, ...runeRewards],
    heroData: hero
  }
}

export const checkAndSetStatBoostHeroes = async (heroes: Hero[]) => {
  const statBoostHeroes: Hero[] = []
  const flagCore = getFlagCore()

  for (const hero of heroes) {
    if (hero.pjstatus === 'SURVIVED' || hero.pjstatus === 'ON_JOURNEY') {
      try {
        const statBoostAvailable = await flagCore.getHeroStorageFlag(
          hero.id,
          HERO_JOURNEY_STORAGE_ID,
          HERO_JOURNEY_ELEMENT_INDEX,
          HERO_JOURNEY_STAT_UP_ELIGIBLE_BIT_INDEX
        )
        const statBoostUsed = await flagCore.getHeroStorageFlag(
          hero.id,
          HERO_JOURNEY_STORAGE_ID,
          HERO_JOURNEY_ELEMENT_INDEX,
          HERO_JOURNEY_STAT_UP_USED_BIT_INDEX
        )

        if (statBoostAvailable && !statBoostUsed) {
          statBoostHeroes.push(hero)
        }
      } catch (error) {
        errorHandler(error)
      }
    }
  }

  dispatch(setStatBoostHeroes(statBoostHeroes))
}
