import { advancedClasses, eliteClasses, exaltedClasses } from 'features/heroes/constants'
import { calculateHeroSummonCost } from 'features/heroes/utils'
import { Hero } from 'utils/dfkTypes'
import { HeroTier, PortalHero, PortalStats, SecondaryPortalHero, Stat, StatLabel } from './types'

export function getHeroTier(heroClass: string): HeroTier {
  if (advancedClasses.includes(heroClass)) {
    return 'advanced'
  } else if (eliteClasses.includes(heroClass)) {
    return 'elite'
  } else if (exaltedClasses.includes(heroClass)) {
    return 'exalted'
  } else {
    return 'basic'
  }
}

export function getMinTears(tier: HeroTier) {
  const minTearsByTier = {
    basic: 10,
    advanced: 40,
    elite: 70,
    exalted: 100
  }
  return minTearsByTier[tier || 'basic']
}

export function getMaxTears(heroLevel: number, minTears: number) {
  const levelDelta = 5
  const tearDelta = 10
  const tierLevel = Math.ceil((heroLevel + 1) / levelDelta - 1)
  return Math.abs(tierLevel * tearDelta) + minTears
}

export function sortStats(stats: PortalStats): Stat[] {
  const allowedStats: StatLabel[] = [
    'strength',
    'dexterity',
    'agility',
    'vitality',
    'endurance',
    'intelligence',
    'wisdom',
    'luck'
  ]
  const statBasePS = { base: 0, p: 0, s: 0 }
  const statsArray = allowedStats.reduce((acc, s, i) => {
    acc.push({ name: s, value: stats[s], weight: 9 - i, ...statBasePS })
    return acc
  }, [] as Stat[])

  // When values are the same, sort by weight for tiebreaker
  const sortedStats = statsArray.sort((a, b) => (a.value !== b.value ? b.value - a.value : b.weight - a.weight))
  return sortedStats.slice(0, 3)
}

function isHireable(hero: PortalHero | SecondaryPortalHero): hero is SecondaryPortalHero {
  return hero.summoningPrice > 0
}

export function updateHeroStates(hero: PortalHero | SecondaryPortalHero, wasHired?: boolean) {
  const heroTier = getHeroTier(hero.class)
  const { level, generation, summons } = hero
  const summonCost = calculateHeroSummonCost(generation, summons)
  const minTears = getMinTears(heroTier)
  const maxTears = getMaxTears(level, minTears)
  const tearsBonus = minTears
  const sortedStats = sortStats(hero.stats as PortalStats)
  if (isHireable(hero)) {
    return {
      ...hero,
      minTears,
      maxTears,
      tearsBonus,
      sortedStats,
      summonCost,
      wasHired
    } as SecondaryPortalHero
  }
  return { ...hero, minTears, maxTears, tearsBonus, sortedStats, summonCost } as PortalHero
}

export function areHeroesRelated(currentlySelectedHero: Hero | null, comparisonHero: Hero | null) {
  // Hero summonerID matches currentlySelectedHero's summonerID, assistantID, or ID (unless Hero is generation 0)
  // Hero assistantID matches currentlySelectedHero's summonerID, assistantID, or ID (unless Hero is generation 0)
  // Hero's ID matches currentlySelectedHero's summonerID or assistantID (unless currentlySelectedHero is generation 0)

  if (!currentlySelectedHero || !comparisonHero) return false
  const currentSelectionSummoner = currentlySelectedHero.summonerId ? Number(currentlySelectedHero.summonerId) : null
  const currentSelectionAssistant = currentlySelectedHero.assistantId ? Number(currentlySelectedHero.assistantId) : null
  const currentSelectionId = parseInt(currentlySelectedHero.id as string) || null
  const currentSelectionGeneration = currentlySelectedHero.generation || null
  const heroAssistant = comparisonHero.assistantId && Number(comparisonHero.assistantId)
  const heroSummoner = comparisonHero.summonerId && Number(comparisonHero.summonerId)
  const heroId = parseInt(comparisonHero.id as string, 10)
  const heroGeneration = comparisonHero.generation

  return (
    (heroGeneration !== 0 && heroSummoner === currentSelectionSummoner) ||
    (heroGeneration !== 0 && heroSummoner === currentSelectionAssistant) ||
    (heroGeneration !== 0 && heroSummoner === currentSelectionId) ||
    (heroGeneration !== 0 && heroAssistant === currentSelectionSummoner) ||
    (heroGeneration !== 0 && heroAssistant === currentSelectionAssistant) ||
    (heroGeneration !== 0 && heroAssistant === currentSelectionId) ||
    (currentSelectionGeneration !== 0 && currentSelectionSummoner === heroId) ||
    (currentSelectionGeneration !== 0 && currentSelectionAssistant === heroId)
  )
}
