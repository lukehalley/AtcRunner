import { Contract } from '@ethersproject/contracts'
import AIRDROP_ABI from 'constants/abis/AirdropClaimV2.json'
import ASSISTINGAUCTION_ABI from 'constants/abis/AssistingAuctionUpgradeable.json'
import MULTI_CHAIN_ABI from 'constants/abis/MultiChain.json'
import PROFILES_ABI from 'constants/abis/Profiles.json'
import STYLIST_ABI from 'constants/abis/Stylist.json'
import TOKENDISBURSE_ABI from 'constants/abis/airdrop/TokenDisburse.json'
import CHARITY_ABI from 'constants/abis/charity/CharityFund.json'
import ALCHEMIST_ABI from 'constants/abis/crafting/Alchemist.json'
import FLAGSTORAGE_ABI from 'constants/abis/flags/FlagStorage.json'
import GEN0_REROLL_ABI from 'constants/abis/heroes/Gen0Reroll.json'
import INVENTORY_ITEM_ABI from 'constants/abis/items/InventoryItem.json'
import ITEM_CONSUMER_ABI from 'constants/abis/items/ItemConsumer.json'
import JOURNEY_ABI from 'constants/abis/journey/Journey.json'
import LANDAUCTION_ABI from 'constants/abis/lands/LandAuction.json'
import LAND_CORE_ABI from 'constants/abis/lands/LandCore.json'
import LEVELING_ABI from 'constants/abis/leveling/MeditationCircle.json'
import QUESTCORE_ABI from 'constants/abis/quests/QuestCore.json'
import QUESTCORE_OLD_ABI from 'constants/abis/quests/QuestCoreOld.json'
import {
  AirdropClaimV2,
  Alchemist,
  AssistingAuctionUpgradeable,
  CharityFund,
  FlagStorage,
  HeroAuctionUpgradeable,
  InventoryItem,
  ItemConsumer,
  Journey,
  LandAuction,
  LandCore,
  MeditationCircle,
  MultiChain,
  Profiles,
  QuestCore,
  QuestCoreOld,
  SaleAuction,
  Stylist,
  TokenDisburse,
  TrainingQuest
} from 'constants/abis/types'
import { Gen0Reroll } from 'constants/abis/types/heroes'
import { AssistingAuctionUpgradeable as AssistingAuctionUpgradeableCV } from 'constants/abis/types/heroes/crystalvale/AssistingAuctionUpgradeable'
import { AIRDROP_ADDRESSESV2 } from 'constants/airdrops'
import {
  ALCHEMIST_ADDRESSES,
  ASSISTINGAUCTION_OLD_ADDRESSES,
  GOLD_ADDRESSES,
  ITEM_CONSUMER_ADDRESSES,
  PROFILES_ADDRESSES,
  STYLIST_ADDRESSES,
  XCRYSTAL_DISBURSE_ADDRESSES,
  ZERO_ONE_ADDRESS
} from 'constants/index'
import { CHARITY_ADDRESSES } from 'features/charity/constants'
import { contractMap } from 'features/contracts/constants'
import { ContractKeys, GetContractData } from 'features/contracts/types'
import { getMappedContract } from 'features/contracts/utils'
import { FLAGCORE_ADDRESSES } from 'features/flagstorage/constants'
import { JOURNEY_ADDRESSES } from 'features/journey/constants'
import { LANDAUCTION_ADDRESSES, LANDCORE_ADDRESSES } from 'features/lands/constants'
import { LEVELING_ADDRESSES } from 'features/leveling/constants'
import { QUESTCORE_ADDRESSES, QUESTCORE_ADDRESSES_OLD } from 'features/quests/constants'
import { GEN0_REROLL_ADDRESSES } from 'features/reroll/constants'
import { getAccount, getChainId, getLibrary } from 'features/web3/utils'
import { getProviderOrSigner, isDFKChainHook } from 'utils'

export const getQuestCoreOld = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = QUESTCORE_ADDRESSES_OLD[chainId] || ZERO_ONE_ADDRESS
  const ABI = QUESTCORE_OLD_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as QuestCoreOld
}

export const getGen0RerollCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = GEN0_REROLL_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = GEN0_REROLL_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as Gen0Reroll
}

export const getQuestCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = QUESTCORE_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = QUESTCORE_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as QuestCore & TrainingQuest
}

export const getHeroCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()

  return isDFKChainHook(chainId)
    ? getMappedContract(contractMap[ContractKeys.HERO_CORE_CV], { account, chainId })
    : getMappedContract(contractMap[ContractKeys.HERO_CORE], { account, chainId })
}

export const getHeroSummoningCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()

  return isDFKChainHook(chainId)
    ? getMappedContract(contractMap[ContractKeys.HERO_SUMMONING_CV], { account, chainId })
    : getMappedContract(contractMap[ContractKeys.HERO_SUMMONING], { account, chainId })
}

export const getAssistingAuctionCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()

  return isDFKChainHook(chainId)
    ? (getMappedContract(contractMap[ContractKeys.ASSISTING_AUCTION_CV], {
        account,
        chainId
      }) as AssistingAuctionUpgradeableCV)
    : (getMappedContract(contractMap[ContractKeys.ASSISTING_AUCTION], {
        account,
        chainId
      }) as AssistingAuctionUpgradeable)
}

export const getAssistingAuctionOldCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = ASSISTINGAUCTION_OLD_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = ASSISTINGAUCTION_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as AssistingAuctionUpgradeable
}

export const getSaleAuctionCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()

  return isDFKChainHook(chainId)
    ? (getMappedContract(contractMap[ContractKeys.SALE_AUCTION_CV], { account, chainId }) as HeroAuctionUpgradeable)
    : (getMappedContract(contractMap[ContractKeys.SALE_AUCTION], { account, chainId }) as SaleAuction)
}

export const getProfilesCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = PROFILES_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = PROFILES_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as Profiles
}

export const getStylistCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = STYLIST_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = STYLIST_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as Stylist
}

export const getLevelingCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = LEVELING_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = LEVELING_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as MeditationCircle
}

export const getGoldCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = GOLD_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = INVENTORY_ITEM_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as InventoryItem
}

export const getAirdropCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = AIRDROP_ADDRESSESV2[chainId] || ZERO_ONE_ADDRESS
  const ABI = AIRDROP_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as AirdropClaimV2
}

export const getAlchemistCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = ALCHEMIST_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = ALCHEMIST_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as Alchemist
}

export const getItemConsumerCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = ITEM_CONSUMER_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = ITEM_CONSUMER_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as ItemConsumer
}

export const getLandCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = LANDCORE_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = LAND_CORE_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as LandCore
}

export const getLandAuctionCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = LANDAUCTION_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = LANDAUCTION_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as LandAuction
}

export const getMultichainCore = (address: string) => {
  const account = getAccount()
  const library = getLibrary()
  const ABI = MULTI_CHAIN_ABI
  return new Contract(address, ABI, getProviderOrSigner(library, account)) as MultiChain
}

export const getJourneyCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = JOURNEY_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = JOURNEY_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as Journey
}

export const getFlagCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = FLAGCORE_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = FLAGSTORAGE_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as FlagStorage
}

export const getXCrystalDisburse = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = XCRYSTAL_DISBURSE_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = TOKENDISBURSE_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as TokenDisburse
}

export const getCharityCore = (data?: GetContractData) => {
  const account = data?.account || getAccount()
  const chainId = data?.chainId || getChainId()
  const library = getLibrary()
  const address = CHARITY_ADDRESSES[chainId] || ZERO_ONE_ADDRESS
  const ABI = CHARITY_ABI

  return new Contract(address, ABI, getProviderOrSigner(library, account)) as CharityFund
}
