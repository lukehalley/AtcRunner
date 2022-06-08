import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const cards = new Quest({
  key: QuestKeys.CARDS,
  title: 'Card Game',
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
    [ChainId.HARMONY_MAINNET]: '0x13E74E4E64805E7fdA381C9BEF1e77cd16086E56',
    [ChainId.HARMONY_TESTNET]: '0xbaD55FC759dfEAe46E543E02c6005cB5910aa3b5',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.LUCKY_MOE,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Card Game',
  tooltipText:
    '<p><strong>Card Game</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Luck tend to be more successful with the Card Game Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Bagh! Take your winnings and get out, ${heroName}! I can't pay tonight's tab with swindlers like you!`,
    fair: `Alright, alright! You win, ${heroName}! Just take your winnings! You won't be so lucky next time!`,
    poor: `Can't believe you got a round on me! Make sure you come back for a rematch, ${heroName}. I'd like to get these winnings back.`,
    bad: `Oh, what a shame! Why not go for another round? I'm sure you'll have a change of luck soon, ${heroName}. Haha!`
  }),
  prompts: ['You’re lookin’ lucky today! Why not play a game of chance?'],
  location: 'Tavern',
  locationUrl: 'tavern',
  trainingStat: 'luck',
  sceneImage: undefined
})
