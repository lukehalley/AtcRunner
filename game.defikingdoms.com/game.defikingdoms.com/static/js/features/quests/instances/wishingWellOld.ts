import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const wishingWellOld = new Quest({
  key: QuestKeys.WISHING_WELL_0_OLD,
  title: 'Wishing Well',
  addresses: {
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
    [ChainId.HARMONY_MAINNET]: '0x0548214A0760a897aF53656F4b69DbAD688D8f29',
    [ChainId.HARMONY_TESTNET]: '0x7f1da8b8F43986a655eb05bbd139b763BDE8B135',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.WISHING_WELL,
  type: QuestType.TimeBased,
  level: 0,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  startQuestName: 'Wishing',
  tooltipText:
    '<p><strong>The Wishing Well</strong> is a Quest that can be undertaken by Heroes of any level and any main profession. The Hero may expend 5 Stamina per attempt and has a chance to receive Gaia’s Tears and a variable amount of experience on each attempt. The maximum number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes, and the time requirement shown will increase as multiple Heroes and multiple attempts are selected.</p>',
  rewardsDialogueMap: undefined,
  prompts: ['The Wishing Well grants at least 1 XP per quest, plus offers a chance to get Tears'],
  baseOnly: true,
  location: 'Meditation Circle',
  locationUrl: 'meditation',
  sceneImage: undefined
})
