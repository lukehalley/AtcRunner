import { ChainId } from 'constants/sdk-extra'

export type DFKContract = {
  abi: any
  addresses: { [chainId in ChainId]: string }
}

export enum ContractKeys {
  ASSISTING_AUCTION = 'assistingAuction',
  ASSISTING_AUCTION_CV = 'assistingAuctionCrystalvale',
  CRYSTAL_CORE = 'crystalCore',
  HERO_BRIDGING = 'heroBridging',
  HERO_BRIDGING_GAS_FEE = 'heroBridgingGasFee',
  HERO_CORE = 'heroCore',
  HERO_CORE_CV = 'heroCoreCrystalvale',
  HERO_SUMMONING = 'heroSummoning',
  HERO_SUMMONING_CV = 'heroSummoningCrystalvale',
  PET_AUCTION = 'petAuction',
  PET_CORE = 'petCore',
  PET_HATCHING = 'petHatching',
  SALE_AUCTION = 'saleAuction',
  SALE_AUCTION_CV = 'saleAuctionCrystalvale',
  STONE_CARVER = 'stoneCarver',
  TEARS_BRIDGING = 'tearsBridging'
}

export interface GetContractData {
  account?: string | null
  chainId?: ChainId
}
