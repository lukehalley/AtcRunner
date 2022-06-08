import ASSISTING_AUCTION_ABI from 'constants/abis/AssistingAuctionUpgradeable.json'
import HERO_BRIDGING_GAS_FEE_ABI from 'constants/abis/bridging/GasFeePricingABI.json'
import HERO_BRIDGING_ABI from 'constants/abis/bridging/HeroBridgeABI.json'
import TEARS_BRIDGING_ABI from 'constants/abis/bridging/TearBridgeABI.json'
import STONE_CARVER_ABI from 'constants/abis/crafting/StoneCarver.json'
import HEROCORE_ABI from 'constants/abis/heroes/HeroCore.json'
import HEROSUMMONING_ABI from 'constants/abis/heroes/HeroSummoning.json'
import SALE_AUCTION_ABI from 'constants/abis/heroes/SaleAuction.json'
import ASSISTING_AUCTION_CV_ABI from 'constants/abis/heroes/crystalvale/AssistingAuctionUpgradeable.json'
import CRYSTALCORE_ABI from 'constants/abis/heroes/crystalvale/CrystalCoreUpgradeable.json'
import SALE_AUCTION_CV_ABI from 'constants/abis/heroes/crystalvale/HeroAuctionUpgradeable.json'
import HEROCORE_CV_ABI from 'constants/abis/heroes/crystalvale/HeroCoreUpgradeable.json'
import HEROSUMMONING_CV_ABI from 'constants/abis/heroes/crystalvale/HeroSummoningUpgradeable.json'
import PET_AUCTION_ABI from 'constants/abis/pets/PetAuction.json'
import PET_CORE_ABI from 'constants/abis/pets/PetCore.json'
import PET_HATCHING_ABI from 'constants/abis/pets/PetHatching.json'
import {
  ASSISTINGAUCTION_ADDRESSES,
  CRYSTALCORE_ADDRESSES,
  HERO_BRIDGING_ADDRESSES,
  HEROCORE_ADDRESSES,
  HEROSUMMONING_ADDRESSES,
  SALEAUCTION_ADDRESSES,
  HERO_BRIDGING_GAS_FEE_ADDRESSES,
  TEARS_BRIDGING_ADDRESSES,
  STONE_CARVER_ADDRESSES
} from 'constants/index'
import { PET_AUCTION_ADDRESSES, PET_CORE_ADDRESSES, PET_HATCHING_ADDRESSES } from 'features/pets/constants'
import { ContractKeys, DFKContract } from './types'

export type ContractMap = {
  [key in ContractKeys]: DFKContract
}

export const contractMap: ContractMap = {
  [ContractKeys.HERO_CORE]: {
    abi: HEROCORE_ABI,
    addresses: HEROCORE_ADDRESSES
  },
  [ContractKeys.HERO_CORE_CV]: {
    abi: HEROCORE_CV_ABI,
    addresses: HEROCORE_ADDRESSES
  },
  [ContractKeys.CRYSTAL_CORE]: {
    abi: CRYSTALCORE_ABI,
    addresses: CRYSTALCORE_ADDRESSES
  },
  [ContractKeys.ASSISTING_AUCTION]: {
    abi: ASSISTING_AUCTION_ABI,
    addresses: ASSISTINGAUCTION_ADDRESSES
  },
  [ContractKeys.ASSISTING_AUCTION_CV]: {
    abi: ASSISTING_AUCTION_CV_ABI,
    addresses: ASSISTINGAUCTION_ADDRESSES
  },
  [ContractKeys.SALE_AUCTION]: {
    abi: SALE_AUCTION_ABI,
    addresses: SALEAUCTION_ADDRESSES
  },
  [ContractKeys.SALE_AUCTION_CV]: {
    abi: SALE_AUCTION_CV_ABI,
    addresses: SALEAUCTION_ADDRESSES
  },
  [ContractKeys.HERO_SUMMONING]: {
    abi: HEROSUMMONING_ABI,
    addresses: HEROSUMMONING_ADDRESSES
  },
  [ContractKeys.HERO_SUMMONING_CV]: {
    abi: HEROSUMMONING_CV_ABI,
    addresses: HEROSUMMONING_ADDRESSES
  },
  [ContractKeys.HERO_BRIDGING]: {
    abi: HERO_BRIDGING_ABI,
    addresses: HERO_BRIDGING_ADDRESSES
  },
  [ContractKeys.HERO_BRIDGING_GAS_FEE]: {
    abi: HERO_BRIDGING_GAS_FEE_ABI,
    addresses: HERO_BRIDGING_GAS_FEE_ADDRESSES
  },
  [ContractKeys.PET_AUCTION]: {
    abi: PET_AUCTION_ABI,
    addresses: PET_AUCTION_ADDRESSES
  },
  [ContractKeys.PET_CORE]: {
    abi: PET_CORE_ABI,
    addresses: PET_CORE_ADDRESSES
  },
  [ContractKeys.PET_HATCHING]: {
    abi: PET_HATCHING_ABI,
    addresses: PET_HATCHING_ADDRESSES
  },
  [ContractKeys.STONE_CARVER]: {
    abi: STONE_CARVER_ABI,
    addresses: STONE_CARVER_ADDRESSES
  },
  [ContractKeys.TEARS_BRIDGING]: {
    abi: TEARS_BRIDGING_ABI,
    addresses: TEARS_BRIDGING_ADDRESSES
  }
}
