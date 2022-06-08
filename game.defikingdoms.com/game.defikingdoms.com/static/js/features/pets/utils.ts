import { PetHatching } from 'constants/abis/types'
import { ZERO_ADDRESS } from 'constants/index'
import { utils } from 'ethers'
import store, { dispatch } from 'features'
import { contractMap } from 'features/contracts/constants'
import { ContractKeys } from 'features/contracts/types'
import { getMappedContract } from 'features/contracts/utils'
import { getAccount } from 'features/web3/utils'
import { DateTime } from 'luxon'
import { YesOrNo } from 'utils/api/types'
import errorHandler from 'utils/errorHandler'
import { Pet } from './Pet'
import { craftingByElement, skillsByEggType } from './constants'
import { setActiveIncubations } from './state'
import { ActiveIncubation, CorePet, FilterMap, MinMax, PetData, ValueMap } from './types'

export function isValueMap(property: string | MinMax | ValueMap | undefined): property is ValueMap {
  return (property as ValueMap).hasOwnProperty('all')
}

export function createUpdatedValueMap(prevValue: ValueMap, newValue: ValueMap) {
  const keys = Object.keys(prevValue)
  const emptyValueMap: ValueMap = Object.fromEntries(keys.map(k => [k, false]))
  const newValueMap = { ...(prevValue.all ? emptyValueMap : prevValue), ...newValue }
  const checkedValuesCount = Object.values(newValueMap).filter(v => v).length
  const allValuesCount = keys.length - 1
  const hasCheckedValue = Object.values(newValueMap).some(v => v)
  if (!newValue.all && hasCheckedValue && (checkedValuesCount < allValuesCount || allValuesCount === 1)) {
    return newValueMap
  }
  return { ...emptyValueMap, all: true }
}

export const fetchActiveIncubations = async ({ account }: { account?: string | null }) => {
  const petHatchingCore = getMappedContract(contractMap[ContractKeys.PET_HATCHING]) as PetHatching

  if (petHatchingCore && account) {
    try {
      const rawActiveIncubations = await petHatchingCore.getUserEggs(account)
      const activeIncubations: Array<ActiveIncubation> = []

      for (let i = 0; i < rawActiveIncubations.length; i++) {
        const rawIncubationIndex = Number(rawActiveIncubations[i])
        const rawIncubation = await petHatchingCore.getEgg(rawIncubationIndex)

        const { id, eggType, finishTime } = rawIncubation
        activeIncubations.push({
          id: Number(id),
          eggType,
          finishTime: DateTime.fromMillis(Number(finishTime) * 1000)
        })
      }

      const sortedIncubations = activeIncubations.sort((a, b) => a.finishTime.toMillis() - b.finishTime.toMillis())
      dispatch(setActiveIncubations(sortedIncubations))
    } catch (e) {
      errorHandler(e)
    }
  }
}

export function getParams(petFilters: FilterMap) {
  const status = Object.keys(petFilters.basic.status)
    .filter(s => s !== 'all')
    .filter(s => petFilters.basic.status[s])

  const shiny = Object.keys(petFilters.basic.shiny)
    .filter(s => s !== 'all')
    .filter(s => petFilters.basic.shiny[s]) as YesOrNo[]

  const gathering = ((Object.keys(petFilters.basic.gathering) as string[]).filter(p => p !== 'all') as string[])
    .filter(g => petFilters.basic.gathering[g])
    .map(g => skillsByEggType.findIndex(s => s === g))

  const crafting = ((Object.keys(petFilters.basic.crafting) as string[]).filter(p => p !== 'all') as string[])
    .filter(c => petFilters.basic.crafting[c])
    .map(c => craftingByElement.findIndex(s => s === c))

  const combat = Object.keys(petFilters.basic.combat)
    .filter(s => s !== 'all')
    .filter(s => petFilters.basic.combat[s])

  return petFilters.basic.id
    ? {
        id: petFilters.basic.id
      }
    : {
        bonusCount: petFilters.basic.bonusCount || undefined,
        rarity: petFilters.basic.rarity || undefined,
        saleprice: petFilters.basic.price || undefined,
        status: status.length ? status[0] : undefined,
        shiny: shiny.length ? shiny[0] : undefined,
        gathering: gathering.length ? gathering : undefined,
        crafting: crafting.length ? crafting : undefined,
        combat: combat.length ? combat : undefined
      }
}

export function filterAuctionsByUserDetails(pet: PetData) {
  const account = getAccount()
  return !pet.privateauctionprofile || pet.privateauctionprofile === account.toLowerCase()
}

export function filterBadPetData(pet: PetData) {
  return typeof pet.appearance != 'undefined' && typeof pet.season != 'undefined' && typeof pet.eggtype != 'undefined'
}

// export async function buildHistoricSale(auction: AuctionData) {
//   let seller
//   let winner
//   try {
//     const profilesCore = getProfilesCore()
//     seller = await profilesCore.getProfile(auction.seller)
//     winner = await profilesCore.getProfile(auction.winner)
//   } catch (error) {
//     console.log('error getting hero or profile', error)
//   }
//   return {
//     id: auction.id,
//     endedAt: auction.endedat,
//     endingPrice: auction.endingprice,
//     tokenId: { id: auction.tokenid },
//     seller: {
//       id: seller?.owner,
//       name: seller?.name
//     },
//     winner: {
//       id: winner?.owner,
//       name: winner?.name
//     }
//   }
// }

// export function buildPurchaseLog(purchase: AuctionData, tokenId: any) {
//   return {
//     id: purchase.id,
//     endedAt: purchase.endedat,
//     endingPrice: purchase.endingprice,
//     purchasePrice: purchase.purchaseprice || purchase.endingprice,
//     startedAt: purchase.startedat,
//     startingPrice: purchase.startingprice,
//     tokenId
//   }
// }

export const printPetInfo = async (petId: string) => {
  // TODO: add print pet option
}

export const buildPet = (pet: CorePet, userPet?: boolean): PetData => {
  const account = getAccount()
  const userProfile = store.getState().profile.profile

  return {
    id: pet.id.toString(),
    owner: userPet ? userProfile?.owner || account : '',
    previousowner: ZERO_ADDRESS,
    owner_name: userPet ? userProfile?.name || 'N/A' : '',
    owner_picid: userPet ? userProfile?.picUri || '' : '',
    owner_address: userPet ? userProfile?.owner || '' : '',
    owner_nftid: '',
    owner_collectionid: '',
    creator: userPet ? userProfile?.owner || '' : '',
    name: pet.name,
    season: pet.season,
    eggtype: pet.eggType,
    rarity: pet.rarity,
    element: pet.element,
    bonuscount: pet.bonusCount,
    profbonus: pet.profBonus,
    profbonusscalar: pet.profBonusScalar,
    craftbonus: pet.craftBonus,
    craftbonusscalar: pet.craftBonusScalar,
    combatbonus: pet.combatBonus,
    combatbonusscalar: pet.combatBonusScalar,
    appearance: pet.appearance,
    background: pet.background,
    shiny: pet.shiny,
    privateauctionprofile: null,
    hungryat: Number(pet.hungryAt).toString(),
    equippableat: Number(pet.equippableAt).toString(),
    equippedto: Number(pet.equippedTo).toString(),
    saleauction: null,
    saleprice: null
  }
}

export const buildAPIPet = (pet: PetData) => {
  if (pet.saleprice) {
    pet.saleprice = parseFloat(utils.formatEther(pet.saleprice))
  }

  return pet
}

export const formatCreatorUsername = (creatorInfo: string) => {
  const twitterUrl = 'https://twitter.com/'
  if (creatorInfo.includes(twitterUrl)) {
    const user = creatorInfo.slice(twitterUrl.length, creatorInfo.length)
    return `@${user}`
  } else {
    return creatorInfo
  }
}

export const addRarityDescriptor = (pet: Pet) => {
  switch (pet.name) {
    case 'Spectral Stag':
      return '<p>It’s believed these spectral variants are reincarnations of a Hero’s ancestor, watching over their descendants. These results are linked to the Inner Groves planal energy bleeding into our world.</p>'
    case 'Stag of Renewal':
      return '<p>Infused with the effects of Saphrinox channeling Irae’s scorching vibrancy, these stags continue the work of the God of Renewal, smiting the Blighted Ones spawned during the Dark Age.</p>'
    case 'Fairling Stag':
      return '<p>Stark white, these mysterious variants are said to have connections to a fabled Pale Grove, hidden deep in the Fairling Forest.</p>'
    case 'Rune Stag':
      return '<p>Manifesting decorative swirls in their fur, these enigmatic beings are thought to have once been battle companions of Theonor the Wise, an Archdruid of yore.</p>'
    case 'Dire Wolf of Renewal':
    case 'Wolf Pup of Renewal':
      return '<p>Infused with the effects of Saphrinox channeling Irae’s scorching vibrancy, these wolves continue the work of the God of Renewal, smiting the Blighted Ones spawned during the Dark Age.</p>'
    case 'Shadow Dire Wolf':
    case 'Shadow Wolf Pup':
      return '<p>These elusive variants are considered a good omen by Death Oracles, for it is said that Naera, the Goddess of Death, is fond of them.</p>'
    case 'Spectral Dire Wolf':
    case 'Spectral Wolf Pup':
      return '<p>It’s believed these spectral variants are reincarnations of a Hero’s ancestor, watching over their descendants. These results are linked to the Inner Grove’s planal energy bleeding into our world.</p>'
    case 'Emerald Dire Wolf':
    case 'Emerald Wolf Pup':
      return '<p>These exceedingly rare variants are thought to have been created by Dyan, the God of Craftsmanship and Wisdom. Assembled from thousands of chips of magically-infused emerald, this act would take a mortal gem crafter many years, but for a god, merely a moment.</p>'
    case 'Dreamstone Dire Wolf':
    case 'Dreamstone Wolf Pup':
      return '<p>Mriya, the Mother of Dreams, observes all who dwells in the dream state. Those who become trapped in their dreams may seldom be visited by a wolf made of coalesced dream dust. Befriending this wolf may allow it to become manifested in the mortal plane.</p>'
    default:
      return ''
  }
}
