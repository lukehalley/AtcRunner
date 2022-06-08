import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { alchemistAssistance } from './instances/alchemistAssistance'
import { armWrestling } from './instances/armWrestling'
import { ball } from './instances/ball'
import { cards } from './instances/cards'
import { dancing } from './instances/dancing'
import { darts } from './instances/darts'
import { fishingLevel0 } from './instances/fishingLevel0'
import { fishingLevel0Old } from './instances/fishingLevel0Old'
import { foragingLevel0 } from './instances/foragingLevel0'
import { foragingLevel0Old } from './instances/foragingLevel0Old'
import { gardeningLevel0 } from './instances/gardeningLevel0'
import { goldMiningLevel0 } from './instances/goldMiningLevel0'
import { helpingTheFarm } from './instances/helpingTheFarm'
import { jewelMiningLevel0 } from './instances/jewelMiningLevel0'
import { puzzleSolving } from './instances/puzzleSolving'
import { wishingWell } from './instances/wishingWell'
import { wishingWellOld } from './instances/wishingWellOld'
import { arnold } from './providers/arnold'
import { druidLam } from './providers/druidLam'
import { esotericWanderer } from './providers/esotericWanderer'
import { farmerQuill } from './providers/farmerQuill'
import { fisherTom } from './providers/fisherTom'
import { iceWeaverZaine } from './providers/iceReaverZaine'
import { isabelle } from './providers/isabelle'
import { layla } from './providers/layla'
import { luckyMoe } from './providers/luckyMoe'
import { orvin } from './providers/orvin'
import { quarrysmithGren } from './providers/quarrysmithGren'
import { streetKidCarlin } from './providers/streetKidCarlin'
import { woodsmanAurum } from './providers/woodsmanAurum'
import { QuestMap, QuestKeys, QuestProviderKeys, QuestProviderMap } from './types'

export const QUESTCORE_ADDRESSES_OLD: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0x5100Bd31b822371108A0f63DCFb6594b9919Eaf4',
  [ChainId.HARMONY_TESTNET]: '0x13e4818A1433A7B63f228266d9d5e5c42B015ba5',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const QUESTCORE_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.ROPSTEN]: ZERO_ONE_ADDRESS,
  [ChainId.RINKEBY]: ZERO_ONE_ADDRESS,
  [ChainId.GÖRLI]: ZERO_ONE_ADDRESS,
  [ChainId.KOVAN]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.BSC_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCHE_C_CHAIN]: ZERO_ONE_ADDRESS,
  [ChainId.AVALANCE_FUJI_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_MAINNET]: ZERO_ONE_ADDRESS,
  [ChainId.DFK_TESTNET]: ZERO_ONE_ADDRESS,
  [ChainId.HARMONY_MAINNET]: '0xAa9a289ce0565E4D6548e63a441e7C084E6B52F6',
  [ChainId.HARMONY_TESTNET]: '0x359C91d97a8859619f31E2E8A6294B3607053Ad7',
  [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
}

export const questMap: QuestMap = {
  [QuestKeys.FISHING_0]: fishingLevel0,
  [QuestKeys.FISHING_0_OLD]: fishingLevel0Old,
  [QuestKeys.FORAGING_0]: foragingLevel0,
  [QuestKeys.FORAGING_0_OLD]: foragingLevel0Old,
  [QuestKeys.GARDENING_0]: gardeningLevel0,
  [QuestKeys.JEWEL_MINING_0]: jewelMiningLevel0,
  [QuestKeys.GOLD_MINING_0]: goldMiningLevel0,
  [QuestKeys.WISHING_WELL_0]: wishingWell,
  [QuestKeys.WISHING_WELL_0_OLD]: wishingWellOld,
  [QuestKeys.ARM_WRESTLE]: armWrestling,
  [QuestKeys.DARTS]: darts,
  [QuestKeys.CARDS]: cards,
  [QuestKeys.BALL]: ball,
  [QuestKeys.DANCING]: dancing,
  [QuestKeys.ALCHEMIST_ASSISTANCE]: alchemistAssistance,
  [QuestKeys.HELPING_THE_FARM]: helpingTheFarm,
  [QuestKeys.PUZZLE_SOLVING]: puzzleSolving
}

export const questProviderMap: QuestProviderMap = {
  [QuestProviderKeys.FISHER_TOM]: fisherTom,
  [QuestProviderKeys.WOODSMAN_AURUM]: woodsmanAurum,
  [QuestProviderKeys.DRUID_LAM]: druidLam,
  [QuestProviderKeys.QUARRYSMITH_GREN]: quarrysmithGren,
  [QuestProviderKeys.WISHING_WELL]: esotericWanderer,
  [QuestProviderKeys.ICE_REAVER_ZAINE]: iceWeaverZaine,
  [QuestProviderKeys.LAYLA]: layla,
  [QuestProviderKeys.LUCKY_MOE]: luckyMoe,
  [QuestProviderKeys.STREET_KID_CARLIN]: streetKidCarlin,
  [QuestProviderKeys.ISABELLE]: isabelle,
  [QuestProviderKeys.ARNOLD]: arnold,
  [QuestProviderKeys.FARMER_QUILL]: farmerQuill,
  [QuestProviderKeys.ORVIN]: orvin
}
