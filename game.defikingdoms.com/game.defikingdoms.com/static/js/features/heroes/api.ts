import { ChainId } from 'constants/sdk-extra'
import { getChainId } from 'features/web3/utils'
import {
  generateArrayParam,
  generateBooleanParam,
  generateNumericOperationParam,
  generateStringEqualityParam,
  generateMinMaxParam
} from 'utils/api'
import { RangeValue } from 'utils/api/types'
import errorHandler from 'utils/errorHandler'
import { CV_STARTING_HERO_ID, REQUEST } from './constants'
import {
  AuctionData,
  GetAuctionsPayload,
  GetHeroesPayload,
  HeroesDataPayload,
  Order,
  SaleOrRent,
  ThunkHeroesPayload
} from './types'
import {
  buildAPIHero,
  buildHistoricSale,
  buildPurchaseLog,
  filterAuctionsByUserDetails,
  filterBadHeroData,
  getStatAbbreviation,
  getValueFromHeroClass,
  lineageBuilder
} from './utils'

export async function getHeroesByAssistingAuction(payload?: GetHeroesPayload): Promise<ThunkHeroesPayload> {
  try {
    const assistPrice = payload?.params?.assistingprice
    const assistMinPrice = assistPrice && assistPrice[0] > 1 ? assistPrice[0] : 1
    const assistMaxPrice = assistPrice && assistPrice[1] < 9999999 ? assistPrice[1] : 9999999
    const { data: hirableHeroes, length } = await getHeroData({
      ...payload,
      params: { ...payload?.params, assistingprice: [assistMinPrice, assistMaxPrice] }
    })
    const hirableHeroesByUserDetails = hirableHeroes.filter(filterAuctionsByUserDetails)
    return { data: hirableHeroesByUserDetails.map(buildAPIHero), length }
  } catch (error) {
    errorHandler(error)
    return { data: [], length: 0 }
  }
}

export async function getAssistingAuctionData(payload?: GetAuctionsPayload): Promise<AuctionData[]> {
  const chainId = getChainId()
  const params =
    payload &&
    payload.params &&
    [
      generateArrayParam('id', payload.params.id),
      generateBooleanParam('open', payload.params.open),
      generateNumericOperationParam('tokenid', '=', parseInt(payload.params.tokenId as string) || undefined),
      generateStringEqualityParam('seller', payload.params.seller)
    ].filter(p => p)

  const response = await fetch(REQUEST.assistAuctions[chainId], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      params,
      offset: payload?.offset || 0,
      limit: 100,
      order: {
        orderBy: payload?.order?.by,
        orderDir: payload?.order?.dir
      }
    })
  })

  const data = await response.json()
  return data
}

export async function getHeroesByAuction(payload?: GetHeroesPayload): Promise<ThunkHeroesPayload> {
  try {
    const auctionSalePrice = payload?.params?.saleprice
    const auctionMinPrice = auctionSalePrice && auctionSalePrice[0] > 1 ? auctionSalePrice[0] : 1
    const auctionMaxPrice = auctionSalePrice && auctionSalePrice[1] < 9999999 ? auctionSalePrice[1] : 9999999
    const { data: forSaleHeroes, length } = await getHeroData({
      ...payload,
      params: { ...payload?.params, saleprice: [auctionMinPrice, auctionMaxPrice] }
    })
    const forSaleHeroesByUserDetails = forSaleHeroes.filter(filterAuctionsByUserDetails)
    return { data: forSaleHeroesByUserDetails.map(buildAPIHero), length }
  } catch (error) {
    errorHandler(error)
    return { data: [], length: 0 }
  }
}

export async function getAuctionData(payload?: GetAuctionsPayload): Promise<AuctionData[]> {
  const chainId = getChainId()
  const params =
    payload &&
    payload.params &&
    [
      generateArrayParam('id', payload.params.id),
      generateBooleanParam('open', payload.params.open),
      generateNumericOperationParam('tokenid', '=', parseInt(payload.params.tokenId as string) || undefined),
      generateStringEqualityParam('seller', payload.params.seller)
    ].filter(p => p)

  const response = await fetch(REQUEST.salesAuctions[chainId], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      params,
      offset: payload?.offset || 0,
      limit: 100,
      order: {
        orderBy: payload?.order?.by,
        orderDir: payload?.order?.dir
      }
    })
  })
  const data = await response.json()
  return data
}

export async function getHeroSalesHistory(payload: GetAuctionsPayload) {
  try {
    const auctions = await getAuctionData({ ...payload, params: { ...payload.params, open: false } })
    const heroSalesHistory = await Promise.all(auctions.map(async (a: AuctionData) => await buildHistoricSale(a)))
    return heroSalesHistory
  } catch (error) {
    errorHandler(error)
    return []
  }
}

export async function getPurchaseHistory(saleOrRent: SaleOrRent, payload: GetAuctionsPayload) {
  const auctionPayload = {
    ...payload,
    params: { ...payload.params, open: false },
    order: { by: 'endedat', dir: 'desc' } as Order
  }
  try {
    let purchases
    if (saleOrRent === SaleOrRent.sale) {
      purchases = await getAuctionData(auctionPayload)
    } else {
      purchases = await getAssistingAuctionData(auctionPayload)
    }
    const purchasedHeroIds = purchases.map((p: AuctionData) => p.tokenid)
    const { data: heroes } = await getHeroData({ params: { id: purchasedHeroIds } })
    const purchaseHistory = purchases.map((p: AuctionData) => {
      const hero = heroes.find(h => h.id === p.tokenid)
      if (hero) {
        return buildPurchaseLog(p, hero)
      }
      return {}
    })
    return purchaseHistory
  } catch (error) {
    errorHandler(error)
    return []
  }
}

export async function getHeroLineage(id: string) {
  try {
    const { data: hero } = await getHeroData({ params: { id } })
    if (hero[0].generation > 0) {
      const [summoner, assistant] = lineageBuilder(hero[0])
      const { data: summonerHero } = await getHeroData({ params: { id: summoner?.id } })
      const [summonerSummoner, summonerAssistant] = lineageBuilder(summonerHero[0])
      const { data: assistantHero } = await getHeroData({ params: { id: assistant?.id } })
      const [assistantSummoner, assistantAssistant] = lineageBuilder(assistantHero[0])
      return {
        id: hero[0].id,
        summonerId: {
          ...summoner,
          summonerId: summonerSummoner,
          assistantId: summonerAssistant
        },
        assistantId: {
          ...assistant,
          summonerId: assistantSummoner,
          assistantId: assistantAssistant
        }
      }
    } else {
      return {}
    }
  } catch (error) {
    errorHandler(error)
    return {}
  }
}

export async function getHeroById(id: string) {
  const hero = await getHeroes({ params: { id } })
  return hero.data
}

export async function getHeroes(payload?: GetHeroesPayload, chainId?: ChainId) {
  try {
    const { data, length } = await getHeroData(payload, chainId)
    const heroes = data.map(buildAPIHero)
    return { data: heroes, length }
  } catch (error) {
    errorHandler(error)
    return {
      data: [],
      length: 0
    }
  }
}

async function getHeroData(payload?: GetHeroesPayload, hookChainId?: ChainId): Promise<HeroesDataPayload> {
  const stats = payload?.params?.stats?.map(s => generateMinMaxParam(s.field, s.values as RangeValue)).flat() || []
  const skills =
    payload?.params?.skills
      ?.map(s => generateMinMaxParam(s.field, s.values?.map(v => v * 10) as RangeValue, 0, 99990))
      .flat() || []
  const params =
    payload && payload.params
      ? [
          ...stats,
          ...skills,
          ...generateMinMaxParam('generation', payload?.params?.generation, 0, 11),
          ...generateMinMaxParam('level', payload?.params?.level, 1, 100),
          ...generateMinMaxParam('summons_remaining', payload?.params?.summonsRemaining, 0, 10),
          ...generateMinMaxParam('rarity', payload?.params?.rarity, 0, 4),
          ...generateMinMaxParam('saleprice', payload?.params?.saleprice, 0, 9999999, true),
          ...generateMinMaxParam('assistingprice', payload?.params?.assistingprice, 0, 9999999, true),
          payload.params.id && Array.isArray(payload.params.id)
            ? generateArrayParam('id', payload.params.id)
            : payload.params.id
            ? generateArrayParam('id', [Number(payload.params.id) + CV_STARTING_HERO_ID, Number(payload.params.id)])
            : null,
          generateStringEqualityParam('owner', payload.params.owner),
          generateStringEqualityParam('previousowner', payload.params.previousowner),
          generateStringEqualityParam('pjowner', payload.params.pjowner),
          generateStringEqualityParam('pjstatus', payload.params.pjstatus),
          generateStringEqualityParam('network', payload.params.network),
          generateStringEqualityParam('originrealm', payload.params.originrealm),
          generateStringEqualityParam('privateauctionprofile', payload.params.privateauctionprofile),
          generateArrayParam('gender', payload.params.gender as string[]),
          generateArrayParam('mainclass', payload.params.mainClass?.map(getValueFromHeroClass)),
          generateArrayParam('subclass', payload.params.subClass?.map(getValueFromHeroClass)),
          generateArrayParam('profession', payload.params.profession as string[]),
          generateArrayParam('background', payload.params.background),
          generateArrayParam('element', payload.params.element as string[]),
          generateArrayParam('statboost1', payload.params.statBoost1?.map(getStatAbbreviation)),
          generateArrayParam('statboost2', payload.params.statBoost2?.map(getStatAbbreviation)),
          generateBooleanParam('shiny', payload.params.shiny?.[0])
        ].filter(p => p)
      : []
  const order = {
    orderBy: payload?.order?.by?.toLowerCase() || 'id',
    orderDir: payload?.order?.dir || 'asc'
  }

  const chainId = hookChainId || getChainId()
  const response = await fetch(REQUEST.heroes[chainId], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      limit: payload?.params?.limit || 100,
      params,
      offset: payload?.offset || 0,
      order
    })
  })

  const data = await response.json()
  const filteredHeroes = data.filter(filterBadHeroData)
  return { data: filteredHeroes, length: data.length }
}
