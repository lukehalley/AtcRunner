import { getFirstName, getFullName, getLastName } from 'components/_DeFiKingdoms/_helpers/names'
import { ZERO_ADDRESS } from 'constants/index'
import { BigNumber, utils } from 'ethers'
import store from 'features'
import { CV_STARTING_HERO_ID } from 'features/heroes/constants'
import { Profile } from 'features/profile/types'
import { getStaminaCooldown } from 'features/quests/utils'
import { getAccount } from 'features/web3/utils'
import { DateTime } from 'luxon'
import { YesOrNo } from 'utils/api/types'
import { getHeroCore, getProfilesCore } from 'utils/contracts'
import { Hero, HeroStatGenes, HeroVisualGenes } from 'utils/dfkTypes'
import errorHandler from 'utils/errorHandler'
import { getHeroById } from './api'
import { choices, classes, RARITY_LEVELS, statsAbbreviationMap, statsGenesMap, visualGenesMap } from './constants'
import {
  AuctionData,
  BackgroundValues,
  ClassKeys,
  ClassValues,
  ElementValues,
  GenderValues,
  HeroData,
  ProfessionValues,
  StatKeys
} from './types'

export const calculateHeroSummonCost = (summonerGen: any, totalHeroesAlreadySummoned: any) => {
  const baseCost = 6
  const perChildIncrease = 2
  const GenerationIncrease = 10

  let totalCost = baseCost + perChildIncrease * totalHeroesAlreadySummoned + GenerationIncrease * summonerGen

  if (summonerGen === 0 && totalCost > 30) {
    totalCost = 30
  }

  return totalCost
}

export const calculateRemainingStamina = (hero: any) => {
  const secondsPerStaminaPoint = getStaminaCooldown()
  const currentTime = DateTime.fromJSDate(new Date())
  const staminaFullAt = hero.staminaFullAt && DateTime.fromJSDate(new Date(hero.staminaFullAt))

  if (!staminaFullAt || staminaFullAt <= currentTime) {
    return hero.stats.stamina
  }

  const diffInSeconds = staminaFullAt.diff(currentTime, ['seconds'])
  const finalDiff = diffInSeconds.toObject().seconds

  if (finalDiff) {
    return hero.stats.stamina - Math.ceil(finalDiff / secondsPerStaminaPoint)
  } else {
    return hero.stats.stamina
  }
}

export const updatedStaminaCooldown = (hero: any, staminaSubtracted: number) => {
  const secondsPerStaminaPoint = getStaminaCooldown()
  const staminaFullAt =
    hero.staminaFullAt.ts === 0 || hero.staminaFullAt <= DateTime.now()
      ? DateTime.fromJSDate(new Date())
      : DateTime.fromJSDate(new Date(hero.staminaFullAt))
  return staminaFullAt.plus({ seconds: secondsPerStaminaPoint * staminaSubtracted })
}

export const calculateCurrentAuctionPrice = (
  startingPrice: number,
  endingPrice: number,
  startedAt: number,
  duration: number
) => {
  if (startingPrice === endingPrice) {
    return startingPrice
  } else {
    const currentTime = DateTime.fromJSDate(new Date())
    const auctionStartedAt = DateTime.fromJSDate(new Date(startedAt * 1000))

    const diffInSeconds = auctionStartedAt.diff(currentTime, ['seconds'])
    const finalDiff = diffInSeconds.toObject().seconds
    let percentTimeElapsed = 1

    // If duration hasn't passed, calculate elapsed time percentage.
    if (finalDiff && finalDiff < 0) {
      percentTimeElapsed = Number(finalDiff) / Number(duration)
    }

    // Calculate price from percentage of elpased time.
    const priceDiff = startingPrice - endingPrice
    const priceCut = -percentTimeElapsed * priceDiff
    const currentPrice = startingPrice - priceCut

    let finalPrice = currentPrice
    if (
      (startingPrice > endingPrice && currentPrice < endingPrice) ||
      (startingPrice < endingPrice && currentPrice > endingPrice)
    ) {
      finalPrice = endingPrice
    }

    // Round to 1 decimal.
    const currentPriceFormatted = (Math.round(finalPrice * 100) / 100).toFixed(1)
    return Number(currentPriceFormatted)
  }
}

export const calculatePriceChangeOverTime = (startingPrice: number, endingPrice: number, duration: number) => {
  const priceMovement = Math.abs(Number(startingPrice) - Number(endingPrice))
  const durationInSeconds = Number(duration)
  const priceChangePerSecond = priceMovement / durationInSeconds
  const formattedPriceChangePerSecond = Math.round(priceChangePerSecond * Math.pow(10, 4)) / Math.pow(10, 4)
  return formattedPriceChangePerSecond
}

export function getParams(heroFilters: any) {
  const profession = (
    (Object.keys(heroFilters.attributes.professions) as string[]).filter(p => p !== 'all') as ProfessionValues[]
  ).filter(p => heroFilters.attributes.professions[p])
  const mainClass = (
    (Object.keys(heroFilters.basic.heroClasses) as string[]).filter(c => c !== 'all') as ClassValues[]
  ).filter(c => heroFilters.basic.heroClasses[c])
  const subClass = (
    (Object.keys(heroFilters.basic.heroSubClasses) as string[]).filter(c => c !== 'all') as ClassValues[]
  ).filter(c => heroFilters.basic.heroSubClasses[c])
  const statBoost1 = (
    (Object.keys(heroFilters.attributes.statBoost1) as string[]).filter(b => b !== 'all') as StatKeys[]
  ).filter(b => heroFilters.attributes.statBoost1[b])
  const statBoost2 = (
    (Object.keys(heroFilters.attributes.statBoost2) as string[]).filter(b => b !== 'all') as StatKeys[]
  ).filter(b => heroFilters.attributes.statBoost2[b])
  const backgrounds = (
    (Object.keys(heroFilters.attributes.backgrounds) as string[]).filter(b => b !== 'all') as BackgroundValues[]
  ).filter(b => heroFilters.attributes.backgrounds[b])
  const elements = (
    (Object.keys(heroFilters.attributes.elements) as string[]).filter(e => e !== 'all') as ElementValues[]
  ).filter(e => heroFilters.attributes.elements[e])
  const genders = (
    (Object.keys(heroFilters.basic.gender) as string[]).filter(g => g !== 'all') as GenderValues[]
  ).filter(g => heroFilters.basic.gender[g])
  const stats = Object.keys(heroFilters.stats.stats).map(k => ({ field: k, values: heroFilters.stats.stats[k] }))
  const skills = Object.keys(heroFilters.stats.skills).map(k => ({
    field: k,
    values: heroFilters.stats.skills[k]
  }))
  const shiny = ((Object.keys(heroFilters.basic.shiny) as string[]).filter(s => s !== 'all') as YesOrNo[]).filter(
    s => heroFilters.basic.shiny[s]
  )

  return heroFilters.basic.id
    ? {
        id: heroFilters.basic.id,
        owner: heroFilters.basic.owner || undefined
      }
    : {
        owner: heroFilters.basic.owner || undefined,
        generation: heroFilters.basic.generation || undefined,
        level: heroFilters.basic.level || undefined,
        summonsRemaining: heroFilters.basic.summonsRemaining || undefined,
        rarity: heroFilters.basic.rarity || undefined,
        price: heroFilters.basic.price || undefined,
        profession: profession.length ? profession : undefined,
        element: elements.length ? elements : undefined,
        mainClass: mainClass.length ? mainClass : undefined,
        subClass: subClass.length ? subClass : undefined,
        statBoost1: statBoost1.length ? statBoost1 : undefined,
        statBoost2: statBoost2.length ? statBoost2 : undefined,
        background: backgrounds.length ? backgrounds : undefined,
        gender: genders.length ? genders : undefined,
        shiny: shiny.length ? shiny : undefined,
        stats: stats.length ? stats : undefined,
        skills: skills.length ? skills : undefined
      }
}

export function buildAPIHero(heroRaw: HeroData): Hero {
  const visualGenes = convertGenes(heroRaw.visualgenes, visualGenesMap) as HeroVisualGenes
  const statGenes = convertGenes(heroRaw.statgenes, statsGenesMap) as HeroStatGenes

  if (typeof heroRaw.id == 'string') {
    heroRaw.id = BigNumber.from(heroRaw.id)
    heroRaw.xp = BigNumber.from(heroRaw.xp)
    heroRaw.staminafullat = BigNumber.from(heroRaw.staminafullat)
    heroRaw.summonedtime = BigNumber.from(heroRaw.summonedtime)
    heroRaw.nextsummontime = BigNumber.from(heroRaw.nextsummontime)
  }

  let auctionPrice = 0
  if (
    heroRaw.saleauction_startingprice &&
    heroRaw.saleauction_endingprice &&
    heroRaw.saleauction_startingprice !== heroRaw.saleauction_endingprice
  ) {
    auctionPrice = calculateCurrentAuctionPrice(
      parseFloat(utils.formatEther(heroRaw.saleauction_startingprice)),
      parseFloat(utils.formatEther(heroRaw.saleauction_endingprice)),
      heroRaw.saleauction_startedat,
      heroRaw.saleauction_duration
    )
  }

  return {
    owner: {
      name: heroRaw.owner_name,
      owner: heroRaw.owner,
      created: heroRaw.owner_created,
      nftId: 0,
      collectionId: 0,
      picUri: ''
    },
    id: heroRaw.id.toNumber(),
    background: visualGenes.background,
    class: statGenes.class || statGenes.mainClass,
    subClass: statGenes.subClass,
    element: statGenes.element,
    gender: visualGenes.gender,
    generation: heroRaw.generation,
    summonerId: heroRaw.summonerid,
    assistantId: heroRaw.assistantid,
    currentQuest: heroRaw.currentquest,
    isQuesting: heroRaw.currentquest !== ZERO_ADDRESS,
    level: heroRaw.level,
    xp: heroRaw.xp.toNumber(),
    firstName: heroRaw.firstname_string || (getFirstName(visualGenes.gender, heroRaw.firstname) as string),
    lastName: heroRaw.lastname_string || getLastName(heroRaw.lastname),
    name:
      heroRaw.firstname_string && heroRaw.lastname_string
        ? `${heroRaw.firstname_string} ${heroRaw.lastname_string}`
        : (getFullName(visualGenes.gender, heroRaw.firstname, heroRaw.lastname) as string),
    network: heroRaw.network,
    originrealm: heroRaw.originrealm,
    rarity: RARITY_LEVELS[heroRaw.rarity],
    rarityNum: heroRaw.rarity,
    shiny: heroRaw.shiny,
    shinyStyle: heroRaw.shiny ? heroRaw.shinystyle : 0,
    currentStamina: Number(heroRaw.current_stamina),
    staminaFullAt: DateTime.fromSeconds(heroRaw.staminafullat.toNumber()),
    summonedDate: DateTime.fromSeconds(heroRaw.summonedtime.toNumber()),
    nextSummonTime: DateTime.fromSeconds(heroRaw.nextsummontime.toNumber()),
    summons: heroRaw.summons,
    maxSummons: heroRaw.maxsummons,
    summonsRemaining: heroRaw.maxsummons < 11 ? heroRaw.maxsummons - heroRaw.summons : 11,
    price: auctionPrice > 0 ? auctionPrice : heroRaw.saleprice ? parseFloat(utils.formatEther(heroRaw.saleprice)) : 0,
    summoningPrice: heroRaw.assistingprice ? parseFloat(utils.formatEther(heroRaw.assistingprice)) : 0,
    winner: heroRaw.privateauctionprofile || heroRaw.winner || null,
    pjstatus: heroRaw.pjstatus,
    pjlevel: heroRaw.pjlevel,
    pjowner: heroRaw.pjowner,
    pjclaimstamp: heroRaw.pjclaimstamp,
    auction: {
      onAuction: heroRaw.saleauction_startingprice !== heroRaw.saleauction_endingprice,
      startingPrice: heroRaw.saleauction_startingprice
        ? parseFloat(utils.formatEther(heroRaw.saleauction_startingprice))
        : 0,
      endingPrice: heroRaw.saleauction_endingprice ? parseFloat(utils.formatEther(heroRaw.saleauction_endingprice)) : 0,
      startedAt: heroRaw.saleauction_startedat,
      duration: heroRaw.saleauction_duration
    },
    visualGenes: visualGenes as HeroVisualGenes,
    statGenes: statGenes as HeroStatGenes,
    stats: {
      id: '',
      strength: heroRaw.strength,
      intelligence: heroRaw.intelligence,
      wisdom: heroRaw.wisdom,
      luck: heroRaw.luck,
      agility: heroRaw.agility,
      vitality: heroRaw.vitality,
      endurance: heroRaw.endurance,
      dexterity: heroRaw.dexterity,
      hp: heroRaw.hp,
      mp: heroRaw.mp,
      stamina: heroRaw.stamina
    },
    statGrowth: {
      primary: {
        strength: heroRaw.strengthgrowthp,
        intelligence: heroRaw.intelligencegrowthp,
        wisdom: heroRaw.wisdomgrowthp,
        luck: heroRaw.luckgrowthp,
        agility: heroRaw.agilitygrowthp,
        vitality: heroRaw.vitalitygrowthp,
        endurance: heroRaw.endurancegrowthp,
        dexterity: heroRaw.dexteritygrowthp
      },
      secondary: {
        strength: heroRaw.strengthgrowths,
        intelligence: heroRaw.intelligencegrowths,
        wisdom: heroRaw.wisdomgrowths,
        luck: heroRaw.luckgrowths,
        agility: heroRaw.agilitygrowths,
        vitality: heroRaw.vitalitygrowths,
        endurance: heroRaw.endurancegrowths,
        dexterity: heroRaw.dexteritygrowths
      }
    },
    skills: {
      mining: heroRaw.mining / 10,
      gardening: heroRaw.gardening / 10,
      fishing: heroRaw.fishing / 10,
      foraging: heroRaw.foraging / 10
    }
  }
}

export function buildContractHero(heroRaw: any, profile: Profile | null): Hero {
  const visualGenes = convertGenes(heroRaw.info.visualGenes, visualGenesMap) as HeroVisualGenes
  const statGenes = convertGenes(heroRaw.info.statGenes, statsGenesMap) as HeroStatGenes

  if (typeof heroRaw.id == 'string') {
    heroRaw.id = BigNumber.from(heroRaw.id)
    heroRaw.state.xp = BigNumber.from(heroRaw.state.xp)
    heroRaw.state.staminaFullAt = BigNumber.from(heroRaw.state.staminaFullAt)
    heroRaw.summoningInfo.summonedTime = BigNumber.from(heroRaw.summoningInfo.summonedTime)
    heroRaw.summoningInfo.nextSummonTime = BigNumber.from(heroRaw.summoningInfo.nextSummonTime)
    heroRaw.info.rarity = RARITY_LEVELS.indexOf(heroRaw.info.rarity.toLowerCase())
  }

  return {
    owner: {
      name: profile ? profile.name : 'N/A',
      owner: profile ? profile.owner : '',
      nftId: profile ? profile.nftId : 0,
      collectionId: profile ? profile.collectionId : 0,
      picUri: profile ? profile.picUri : '',
      created: profile ? profile.created : 0
    },
    background: visualGenes.background,
    class: statGenes.class || statGenes.mainClass,
    subClass: statGenes.subClass,
    element: statGenes.element,
    gender: visualGenes.gender,
    generation: heroRaw.info.generation,
    id: heroRaw.id.toNumber(),
    summonerId: heroRaw.summoningInfo.summonerId,
    assistantId: heroRaw.summoningInfo.assistantId,
    currentQuest: heroRaw.state.currentQuest,
    isQuesting: heroRaw.state.currentQuest !== ZERO_ADDRESS,
    level: heroRaw.state.level,
    xp: heroRaw.state.xp.toNumber(),
    firstName: getFirstName(visualGenes.gender, heroRaw.info.firstName || heroRaw.firstName),
    lastName: getLastName(heroRaw.info.lastName || heroRaw.lastName),
    name: getFullName(visualGenes.gender, heroRaw.info.firstName, heroRaw.info.lastName),
    rarity: RARITY_LEVELS[heroRaw.info.rarity],
    rarityNum: heroRaw.info.rarity,
    shiny: heroRaw.info.shiny,
    shinyStyle: heroRaw.info.shiny ? heroRaw.info.shinyStyle : 0,
    currentStamina: heroRaw.stats.stamina,
    staminaFullAt: DateTime.fromSeconds(heroRaw.state.staminaFullAt.toNumber()),
    summonedDate: DateTime.fromSeconds(heroRaw.summoningInfo.summonedTime.toNumber()),
    nextSummonTime: DateTime.fromSeconds(heroRaw.summoningInfo.nextSummonTime.toNumber()),
    summons: heroRaw.summoningInfo.summons,
    maxSummons: heroRaw.summoningInfo.maxSummons,
    summonsRemaining:
      heroRaw.summoningInfo.maxSummons < 11 ? heroRaw.summoningInfo.maxSummons - heroRaw.summoningInfo.summons : 11,
    price: heroRaw.salePrice ? parseFloat(utils.formatEther(heroRaw.salePrice)) : 0,
    summoningPrice: heroRaw.summoningPrice ? parseFloat(utils.formatEther(heroRaw.summoningPrice)) : 0,
    pjstatus: null,
    pjlevel: null,
    pjowner: null,
    pjclaimstamp: null,
    winner: heroRaw.winner ? heroRaw.winner : null,
    auction: {
      onAuction: heroRaw.startingPrice !== heroRaw.endingPrice ? true : false,
      startingPrice: heroRaw.startingPrice ? parseFloat(utils.formatEther(heroRaw.startingPrice)) : 0,
      endingPrice: heroRaw.endingPrice ? parseFloat(utils.formatEther(heroRaw.endingPrice)) : 0,
      startedAt: heroRaw.startedAt,
      duration: heroRaw.duration
    },
    stats: {
      id: '',
      strength: heroRaw.stats.strength,
      intelligence: heroRaw.stats.intelligence,
      wisdom: heroRaw.stats.wisdom,
      luck: heroRaw.stats.luck,
      agility: heroRaw.stats.agility,
      vitality: heroRaw.stats.vitality,
      endurance: heroRaw.stats.endurance,
      dexterity: heroRaw.stats.dexterity,
      hp: heroRaw.stats.hp,
      mp: heroRaw.stats.mp,
      stamina: heroRaw.stats.stamina
    },
    visualGenes: visualGenes,
    statGenes: statGenes,
    statGrowth: {
      primary: {
        strength: heroRaw.primaryStatGrowth[0],
        intelligence: heroRaw.primaryStatGrowth[1],
        wisdom: heroRaw.primaryStatGrowth[2],
        luck: heroRaw.primaryStatGrowth[3],
        agility: heroRaw.primaryStatGrowth[4],
        vitality: heroRaw.primaryStatGrowth[5],
        endurance: heroRaw.primaryStatGrowth[6],
        dexterity: heroRaw.primaryStatGrowth[7]
      },
      secondary: {
        strength: heroRaw.secondaryStatGrowth[0],
        intelligence: heroRaw.secondaryStatGrowth[1],
        wisdom: heroRaw.secondaryStatGrowth[2],
        luck: heroRaw.secondaryStatGrowth[3],
        agility: heroRaw.secondaryStatGrowth[4],
        vitality: heroRaw.secondaryStatGrowth[5],
        endurance: heroRaw.secondaryStatGrowth[6],
        dexterity: heroRaw.secondaryStatGrowth[7]
      }
    },
    skills: {
      mining: heroRaw.professions.mining / 10,
      gardening: heroRaw.professions.gardening / 10,
      fishing: heroRaw.professions.fishing / 10,
      foraging: heroRaw.professions.foraging / 10
    }
  }
}

function kai2dec(kai: string) {
  const ALPHABET = '123456789abcdefghijkmnopqrstuvwx'
  return ALPHABET.indexOf(kai)
}

function genesToKai(genes: bigint) {
  const ALPHABET = '123456789abcdefghijkmnopqrstuvwx'
  const BASE = BigInt(ALPHABET.length)

  let buf = ''
  while (genes >= BASE) {
    const mod = genes % BASE
    buf = ALPHABET[Number(mod)] + buf
    genes = (genes - mod) / BASE
  }

  // Add the last 4 (finally).
  buf = ALPHABET[Number(genes)] + buf

  // Pad with leading 0s.
  buf = buf.padStart(48, '1')

  return buf.replace(/(.{4})/g, '$1 ')
}

export function convertGenes(_genes: BigNumber, genesMap: { [index: number]: string }) {
  // First, convert the genes to kai.
  const rawKai = genesToKai(BigInt(_genes.toString())).split(' ').join('')
  const genes: { [index: string]: any } = { recessives: {} }
  let count = 0

  for (const k in rawKai.split('')) {
    if (rawKai.hasOwnProperty(k)) {
      const trait = genesMap[Math.floor(Number(k) / 4)]
      const kai = rawKai[k]
      const valueNum = kai2dec(kai)

      // Create base genes
      genes[trait] = choices[trait][valueNum]

      // Create recessives
      if (!genes.recessives[trait]) genes.recessives[trait] = {}
      if (Object.keys(genes.recessives[trait]).length < 3) {
        count++
        const position = 4 - count
        genes.recessives[trait] = {
          ...genes.recessives[trait],
          [`r${position}`]: choices[trait][valueNum]
        }
      } else {
        genes.recessives[trait] = {
          ...genes.recessives[trait],
          d: choices[trait][valueNum]
        }
        count = 0
      }
    }
  }

  return genes as HeroStatGenes | HeroVisualGenes
}

export function filterAuctionsByUserDetails(hero: HeroData) {
  const account = getAccount()
  return (hero.owner_address !== account && !hero.privateauctionprofile) || hero.privateauctionprofile === account
}

export function filterBadHeroData(hero: HeroData) {
  return Boolean(hero.visualgenes && hero.statgenes)
}

export function buildLineageHero(
  id: string,
  generation: number,
  mainclass: ClassKeys,
  rarityNum: number,
  visualgenes: BigNumber
) {
  const visualGenes = convertGenes(visualgenes, visualGenesMap)
  const mainClass = classes[mainclass]
  const rarity = RARITY_LEVELS[rarityNum]
  return { id, generation, visualGenes, class: mainClass, rarity }
}

export function lineageBuilder(hero: any) {
  const positions = ['summoner', 'assistant']
  const lineage = positions.map(p => {
    if (hero[`${p}_id`]) {
      return buildLineageHero(
        hero[`${p}_id`],
        hero[`${p}_generation`],
        hero[`${p}_mainclass`],
        hero[`${p}_rarity`],
        hero[`${p}_visualgenes`]
      )
    } else {
      return null
    }
  })
  return lineage
}

export async function buildHistoricSale(auction: AuctionData) {
  let seller
  let winner
  try {
    const profilesCore = getProfilesCore()
    seller = await profilesCore.getProfile(auction.seller)
    winner = await profilesCore.getProfile(auction.winner)
  } catch (error) {
    console.log('error getting hero or profile', error)
  }
  return {
    id: auction.id,
    endedAt: auction.endedat,
    endingPrice: auction.endingprice,
    tokenId: { id: auction.tokenid },
    seller: {
      id: seller?.owner,
      name: seller?.name
    },
    winner: {
      id: winner?.owner,
      name: winner?.name
    }
  }
}

export function buildPurchaseLog(purchase: AuctionData, tokenId: any) {
  return {
    id: purchase.id,
    endedAt: purchase.endedat,
    endingPrice: purchase.endingprice,
    purchasePrice: purchase.purchaseprice || purchase.endingprice,
    startedAt: purchase.startedat,
    startingPrice: purchase.startingprice,
    tokenId
  }
}

export function getStatAbbreviation(stat: StatKeys) {
  return statsAbbreviationMap[stat]
}

export function getHeroStatByKey(hero: Hero, stat?: StatKeys) {
  if (!stat || !hero.stats) return
  const abbr = getStatAbbreviation(stat)
  if (abbr === hero.statGenes.statBoost1 && abbr === hero.statGenes.statBoost2) {
    return hero.stats?.[stat] + 4
  } else if (abbr === hero.statGenes.statBoost1) {
    return hero.stats?.[stat] + 1
  } else if (abbr === hero.statGenes.statBoost2) {
    return hero.stats?.[stat] + 3
  } else {
    return hero.stats?.[stat]
  }
}

export function getValueFromHeroClass(heroClass: string) {
  return parseInt(Object.keys(classes).find(key => (classes as { [key: string]: string })[key] === heroClass) as string)
}

export const getUpdatedUserHero = async (heroId: string | number | BigNumber): Promise<Hero | null> => {
  const { userHeroes } = store.getState().heroes

  const localHero = userHeroes.filter((hero: Hero) => hero.id === heroId)[0]
  let updatedHero = null

  if (typeof localHero !== 'undefined') {
    updatedHero = localHero
  } else {
    try {
      const hero = await getHeroById(heroId as string)
      if (hero.length > 0) {
        updatedHero = hero[0]
      }
    } catch (error) {
      errorHandler(error)
    }
  }

  return updatedHero
}

export const convertHeroId = (heroIdRaw: string | number | BigNumber) => {
  const heroId = Number(heroIdRaw)
  return heroId >= CV_STARTING_HERO_ID ? heroId - CV_STARTING_HERO_ID : heroId
}

const testProfile: Profile = {
  owner: ZERO_ADDRESS,
  name: 'Tony',
  created: 1234567890,
  nftId: 1,
  collectionId: 1,
  picUri: '1'
}

const date = DateTime.fromJSDate(new Date(1234567890))

export const getTestHero = (heroOverwrites?: {}): Hero => {
  const defaultHero: Hero = {
    id: '1',
    owner: testProfile,
    class: 'knight',
    subClass: 'knight',
    firstName: 'Omega',
    lastName: 'Universes',
    name: 'Omega Universes',
    rarity: 'common',
    staminaFullAt: date,
    summonedDate: date,
    summons: 3,
    maxSummons: 5,
    price: 0,
    summoningPrice: 0,
    winner: null,
    pjclaimstamp: null,
    pjowner: '',
    pjstatus: null,
    pjlevel: 1,
    currentStamina: 0,
    summonsRemaining: 3,
    nextSummonTime: date,
    shinyStyle: 1,
    level: 2,
    xp: 0,
    visualGenes: {
      appendageColor: '58381e',
      backAppendage: 4,
      backAppendageColor: '566f7d',
      background: 'desert',
      eyeColor: '203997',
      gender: 'female',
      hairColor: 'ca93a7',
      hairStyle: 3,
      headAppendage: 0,
      skinColor: '985e1c',
      visualUnknown1: 5,
      visualUnknown2: 5,
      recessives: {
        appendageColor: { d: '58381e', r1: '58381e', r2: '58381e', r3: '58381e' },
        backAppendage: { d: 4, r1: 4, r2: 4, r3: 4 },
        backAppendageColor: { d: '566f7d', r1: '566f7d', r2: '566f7d', r3: '566f7d' },
        background: { d: 'desert', r1: 'desert', r2: 'desert', r3: 'desert' },
        eyeColor: {
          d: '203997',
          r1: '203997',
          r2: '203997',
          r3: '203997'
        },
        gender: { d: 'female', r1: 'female', r2: 'female', r3: 'female' },
        hairColor: { d: 'ca93a7', r1: 'ca93a7', r2: 'ca93a7', r3: 'ca93a7' },
        hairStyle: { d: 3, r1: 3, r2: 3, r3: 3 },
        headAppendage: { d: 0, r1: 0, r2: 0, r3: 0 },
        skinColor: { d: '985e1c', r1: '985e1c', r2: '985e1c', r3: '985e1c' },
        visualUnknown1: { d: 5, r1: 5, r2: 5, r3: 5 },
        visualUnknown2: { d: 5, r1: 5, r2: 5, r3: 5 }
      }
    },
    summonerId: BigInt('1234'),
    assistantId: BigInt('1234'),
    element: 'fire',
    shiny: 'false',
    background: 'desert',
    rarityNum: 2,
    generation: 0,
    gender: 'female',
    auction: {
      onAuction: false,
      startingPrice: 0,
      endingPrice: 0,
      startedAt: 0,
      duration: 0
    },
    statGenes: {
      active1: 'endurance',
      active2: 'strength',
      background: 'forest',
      class: 'knight',
      element: 'fire',
      passive1: 'endurance',
      passive2: 'strength',
      profession: 'mining',
      statBoost1: 'endurance',
      statBoost2: 'strength',
      statsUnknown1: 0,
      statsUnknown2: 0,
      subClass: 'knight',
      mainClass: 'knight',
      recessives: {
        active1: { d: 'endurance', r1: 'endurance', r2: 'endurance', r3: 'endurance' },
        active2: { d: 'strength', r1: 'strength', r2: 'strength', r3: 'strength' },
        background: {
          d: 'forest',
          r1: 'forest',
          r2: 'forest',
          r3: 'forest'
        },
        class: { d: 'knight', r1: 'knight', r2: 'knight', r3: 'knight' },
        element: { d: 'fire', r1: 'fire', r2: 'fire', r3: 'fire' },
        passive1: { d: 'endurance', r1: 'endurance', r2: 'endurance', r3: 'endurance' },
        passive2: { d: 'strength', r1: 'strength', r2: 'strength', r3: 'strength' },
        profession: { d: 'mining', r1: 'mining', r2: 'mining', r3: 'mining' },
        statBoost1: { d: 'endurance', r1: 'endurance', r2: 'endurance', r3: 'endurance' },
        statBoost2: { d: 'strength', r1: 'strength', r2: 'strength', r3: 'strength' },
        statsUnknown1: { d: 0, r1: 0, r2: 0, r3: 0 },
        statsUnknown2: { d: 0, r1: 0, r2: 0, r3: 0 },
        subClass: { d: 'knight', r1: 'knight', r2: 'knight', r3: 'knight' },
        mainClass: { d: 'knight', r1: 'knight', r2: 'knight', r3: 'knight' }
      }
    },
    stats: {
      id: '1',
      intelligence: 10,
      wisdom: 10,
      vitality: 10,
      dexterity: 10,
      strength: 10,
      endurance: 10,
      luck: 10,
      agility: 10,
      hp: 150,
      mp: 40,
      stamina: 25
    },
    skills: {
      mining: 1,
      fishing: 1,
      gardening: 1,
      foraging: 1
    }
  }

  return {
    ...defaultHero,
    ...heroOverwrites
  }
}

export const printHeroInfo = async (heroId: string) => {
  const heroCore = getHeroCore()
  const coreHero = await heroCore?.getHero(heroId)
  const builtHero = buildContractHero(coreHero, null)
  const apiHero = await getHeroById(heroId)
  console.log({ builtHero, coreHero, apiHero })
}
