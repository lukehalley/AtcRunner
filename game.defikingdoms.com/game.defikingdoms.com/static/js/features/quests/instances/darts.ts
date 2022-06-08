import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const darts = new Quest({
  key: QuestKeys.DARTS,
  title: 'Darts',
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
    [ChainId.HARMONY_MAINNET]: '0xe03fd4e2F6421b1251297240cE5248508C9104eD',
    [ChainId.HARMONY_TESTNET]: '0x029e68846BC2661b6e05B458d6511418DB224C71',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.LAYLA,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Darts',
  tooltipText:
    '<p><strong>Darts</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Dexterity tend to be more successful with the Darts Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `A perfect game, ${heroName}. Few can say they bested me in every round. Take this as a reward. Someone of your skill deserves it.`,
    fair: `Ah, good eye...good hands. Nice job, ${heroName}. It's rare someone can match me. Take this as thanks for helping me pass the time.`,
    poor: `Well ${heroName}, at least you got most of the darts on the board. Take this as a reward.`,
    bad: `Ooo...not great. Almost hit the cat. Kessing would have killed you. We'll need to work on your accuracy, ${heroName}.`
  }),
  prompts: [
    'Heroes, majestic warriors from the Inner Groves? Ha, bet you can’t do something as simple as a game of darts! Let’s see what you’re made of.'
  ],
  location: 'Tavern',
  locationUrl: 'tavern',
  trainingStat: 'dexterity',
  sceneImage: undefined
})
