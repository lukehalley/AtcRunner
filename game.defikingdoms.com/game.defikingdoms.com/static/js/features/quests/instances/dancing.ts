import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const dancing = new Quest({
  key: QuestKeys.DANCING,
  title: 'Dancing',
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
    [ChainId.HARMONY_MAINNET]: '0xCb594A24D802cdF65000A84dC0059dde11c9d15f',
    [ChainId.HARMONY_TESTNET]: '0x2468189746Bc26772a1DFE18f89A36676F502880',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.ISABELLE,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Dancing',
  tooltipText:
    '<p><strong>Dancing</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Endurance tend to be more successful with the Dancing Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Perfect! Perfect, ${heroName}! I couldn't ask for a better partner. Here, take this as thanks. I'll be seeing you around, hon.`,
    fair: `Well done, ${heroName}! How bold! You almost swept me up off my feet at the end there! I think you've earned your fair share of the tips.`,
    poor: `I think most people would call that dancing! Though you couldn't quite last till the end. Better than partnering with a log, though! Here's a bit of pay from the tips, ${heroName}.`,
    bad: `Two-left feet and already tired, ${heroName}? Well, perhaps once you've learned to dance and can jig for more than a minute, we could try this again.`
  }),
  prompts: ['I come here often to hear the bards and dance alongside. Care to join me, Hero? I promise it’ll be fun!'],
  location: 'Marketplace',
  locationUrl: 'marketplace',
  trainingStat: 'endurance',
  sceneImage: undefined
})
