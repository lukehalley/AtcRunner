import { ChainId } from 'constants/sdk-extra'
import { getAccount, getChainId } from 'features/web3/utils'
import uniqBy from 'lodash/uniqBy'
import {
  generateArrayParam,
  generateBooleanParam,
  generateNumericOperationParam,
  generateStringEqualityParam,
  generateMinMaxParam
} from 'utils/api'
import errorHandler from 'utils/errorHandler'
import { REQUEST } from './constants'
import { AuctionData, GetAuctionsPayload, GetPetsPayload, PetsDataPayload, ThunkPetsPayload } from './types'
import { buildAPIPet, filterAuctionsByUserDetails, filterBadPetData } from './utils'

export async function getPetsByAuction(payload?: GetPetsPayload): Promise<ThunkPetsPayload> {
  try {
    const auctionSalePrice = payload?.params?.saleprice
    const auctionMinPrice = auctionSalePrice && auctionSalePrice[0] > 1 ? auctionSalePrice[0] : 1
    const auctionMaxPrice = auctionSalePrice && auctionSalePrice[1] < 9999999 ? auctionSalePrice[1] : 9999999
    const { data: forSaleHeroes, length } = await getPetData({
      ...payload,
      params: { ...payload?.params, saleprice: [auctionMinPrice, auctionMaxPrice] }
    })
    const forSalePetsByUserDetails = forSaleHeroes.filter(filterAuctionsByUserDetails)
    return { data: forSalePetsByUserDetails.map(buildAPIPet), length }
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

// export async function getPetSalesHistory(payload: GetAuctionsPayload) {
//   try {
//     const auctions = await getAuctionData({ ...payload, params: { ...payload.params, open: false } })
//     const petSalesHistory = await Promise.all(auctions.map(async (a: AuctionData) => await buildHistoricSale(a)))
//     return petSalesHistory
//   } catch (error) {
//     errorHandler(error)
//     return []
//   }
// }

export async function getPetById(id: number) {
  const pet = await getPets({ params: { id: id.toString() } })
  return pet.length > 0 ? buildAPIPet(pet.data[0]) : null
}

export async function getPets(payload?: GetPetsPayload, chainId?: ChainId) {
  try {
    const { data, length } = await getPetData(payload, chainId)
    const pets = data.map(buildAPIPet)
    return { data: pets, length }
  } catch (error) {
    errorHandler(error)
    return {
      data: [],
      length: 0
    }
  }
}

export async function getPetsCatalog(payload?: GetPetsPayload, chainId?: ChainId) {
  try {
    const hasSalePrice =
      Number(payload?.params?.saleprice?.[0]) > 0 || Number(payload?.params?.saleprice?.[1]) < 9999999
    const isForSaleStatus = payload?.params?.status === 'for_sale'
    let petsData: PetsDataPayload
    if (hasSalePrice || isForSaleStatus) {
      const account = getAccount()
      const privateSalePets = await getPetData(
        { ...payload, params: { ...payload?.params, privateauctionprofile: account } },
        chainId
      )
      const restPets = await getPetData(payload, chainId)
      petsData = {
        data: uniqBy([...privateSalePets.data, ...restPets.data], 'id'),
        length: privateSalePets.length + restPets.length
      }
    } else {
      const res = await getPetData(payload, chainId)
      petsData = { data: res.data, length: res.length }
    }
    const pets = petsData.data.map(buildAPIPet)
    const filteredPets = hasSalePrice || isForSaleStatus ? pets.filter(filterAuctionsByUserDetails) : pets
    return { data: filteredPets, length: petsData.length }
  } catch (error) {
    errorHandler(error)
    return {
      data: [],
      length: 0
    }
  }
}

async function getPetData(payload?: GetPetsPayload, hookChainId?: ChainId): Promise<PetsDataPayload> {
  const params = payload?.params
    ? [
        ...generateMinMaxParam('bonuscount', payload.params.bonusCount, 1, 3),
        ...generateMinMaxParam('rarity', payload.params.rarity, 0, 4),
        ...generateMinMaxParam('saleprice', payload.params.saleprice, 0, 9999999, true),
        payload.params.id ? generateArrayParam('id', [Number(payload.params.id)]) : null,
        payload.params.status === 'for_sale' ? generateNumericOperationParam('saleprice', '>=', 1) : null,
        generateStringEqualityParam('owner', payload.params.owner?.toLowerCase()),
        generateStringEqualityParam('previousowner', payload.params.previousowner?.toLowerCase()),
        generateStringEqualityParam('privateauctionprofile', payload.params.privateauctionprofile?.toLowerCase()),
        generateBooleanParam('shiny', payload.params.shiny),
        ...(payload.params.gathering
          ? [generateArrayParam('profbonus', [1, 80, 160]), generateArrayParam('eggtype', payload.params.gathering)]
          : [null]),
        ...(payload.params.crafting
          ? [generateArrayParam('craftbonus', [1, 80, 160]), generateArrayParam('element', payload.params.crafting)]
          : [null]),
        payload.params.combat ? generateArrayParam('combatbonus', [1, 80, 160]) : null
      ].filter(p => p)
    : []

  const order = {
    orderBy: payload?.order?.by?.toLowerCase() || 'id',
    orderDir: payload?.order?.dir || 'asc'
  }

  const chainId = hookChainId || getChainId()
  const response = await fetch(REQUEST.pets[chainId], {
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
  console.log({ data })

  const filteredPets = data.filter(filterBadPetData)
  return { data: filteredPets, length: data.length }
}
