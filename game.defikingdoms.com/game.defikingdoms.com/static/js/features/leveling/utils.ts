import store, { dispatch } from 'features'
import { buildContractHero } from 'features/heroes/utils'
import { ItemKeys } from 'features/items/types'
import { setActiveMeditations } from 'features/leveling/state'
import { ActiveMeditation } from 'features/leveling/types'
import { getAccount } from 'features/web3/utils'
import { DateTime } from 'luxon'
import { getHeroCore, getLevelingCore } from 'utils/contracts'
import { Hero } from 'utils/dfkTypes'

export const fetchActiveLeveling = async () => {
  const account = getAccount()
  const heroCore = getHeroCore()
  const levelingCore = getLevelingCore()
  const { profile } = store.getState().profile

  if (levelingCore && account) {
    try {
      const rawActiveMeditations = await levelingCore.getActiveMeditations(account)
      const activeMeditations: Array<ActiveMeditation> = []

      for (let i = 0; i < rawActiveMeditations.length; i++) {
        const rawMeditation = rawActiveMeditations[i]
        const { id, heroId, primaryStat, secondaryStat, tertiaryStat } = rawMeditation

        const cleanHeroId = Number(heroId)
        let finalHero = {}
        const { userHeroes } = store.getState().heroes
        const localHero = userHeroes.filter((hero: Hero) => Number(hero.id) === cleanHeroId)[0]

        if (typeof localHero !== 'undefined') {
          finalHero = localHero
        } else {
          const coreHero = await heroCore?.getHero(heroId)
          const builtHero = buildContractHero(coreHero, profile)

          if (builtHero) {
            finalHero = builtHero
          }
        }

        activeMeditations.push({
          id: Number(id),
          hero: finalHero,
          primaryStat,
          secondaryStat,
          tertiaryStat,
          completeAtTime: DateTime.now(),
          startTime: DateTime.now()
        })
      }

      dispatch(setActiveMeditations(activeMeditations))
    } catch (error) {
      throw error
    }
  }
}

export const calculateRequiredXp = (currentLevel: number) => {
  let xpNeeded
  const nextLevel = currentLevel + 1
  switch (true) {
    case currentLevel < 6:
      xpNeeded = nextLevel * 1000
      break
    case currentLevel < 9:
      xpNeeded = 4000 + (nextLevel - 5) * 2000
      break
    case currentLevel < 16:
      xpNeeded = 12000 + (nextLevel - 9) * 4000
      break
    case currentLevel < 36:
      xpNeeded = 40000 + (nextLevel - 16) * 5000
      break
    case currentLevel < 56:
      xpNeeded = 140000 + (nextLevel - 36) * 7500
      break
    case currentLevel >= 56:
      xpNeeded = 290000 + (nextLevel - 56) * 10000
      break
    default:
      xpNeeded = 0
      break
  }

  return xpNeeded
}

export const calculateLevelingJewelCost = (currentLevel: number) => {
  return Math.round(currentLevel * 1) / 10
}

export const calculateRuneRequirements = (currentLevel: number) => {
  const maxRuneRange = 6
  const focusRunePerTier = [ItemKeys.SHVAS_RUNE, ItemKeys.MOKSHA_RUNE, ItemKeys.HOPE_RUNE, ItemKeys.COURAGE_RUNE]
  const runeTier = Math.floor(currentLevel / 10)
  const onesPlace = currentLevel - runeTier * 10
  const runeRangeTier = Math.floor(onesPlace / 2)
  const runeMap = []

  // Backtrack through each tier
  for (let i = runeTier + 1; i > 0; i--) {
    const runeIndex = i - 1
    const focusRune = focusRunePerTier[runeIndex]

    const baseQuantity = runeRangeTier + 1
    let quantity = baseQuantity

    if (runeIndex + 1 === runeTier) {
      quantity = maxRuneRange - baseQuantity
    } else if (runeIndex + 1 < runeTier) {
      quantity = 1
    }

    runeMap.push({
      rune: focusRune,
      quantity
    })
  }

  return runeMap
}
