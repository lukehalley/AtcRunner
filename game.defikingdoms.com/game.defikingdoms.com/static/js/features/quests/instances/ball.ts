import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const ball = new Quest({
  key: QuestKeys.BALL,
  title: 'Game of Ball',
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
    [ChainId.HARMONY_MAINNET]: '0xFA20B218927B0f57a08196743488c7C790a5625B',
    [ChainId.HARMONY_TESTNET]: '0x115153e27395628befa2F2c62d26F9729782A36a',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.STREET_KID_CARLIN,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Game of Ball',
  tooltipText:
    '<p><strong>Game of Ball</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Agility tend to be more successful with the Game of Ball Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Wow! You're great at this! Thank you, ${heroName}. It's almost like I had friends there for a moment.`,
    fair: `Haha! That was a blast, ${heroName}! I can't remember the last time I had so much fun. Take this as thanks.`,
    poor: `I didn't expect to beat an adult. Maybe all that armor is weighing you down? Here, take this, ${heroName}.`,
    bad: `Sheesh, ${heroName}. Did you play ball as a kid? You're clumsy as all get-out.`
  }),
  prompts: ['Care to play a game of ball with me? My friends are never around—gets boring without someone.'],
  location: 'Marketplace',
  locationUrl: 'marketplace',
  trainingStat: 'agility',
  sceneImage: undefined
})
