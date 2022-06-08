import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const puzzleSolving = new Quest({
  key: QuestKeys.PUZZLE_SOLVING,
  title: 'Puzzle Solving',
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
    [ChainId.HARMONY_MAINNET]: '0x347097454fA1931A4e80dcDebb31F29FC355CbCE',
    [ChainId.HARMONY_TESTNET]: '0x77b92ca6CADF2acdC60BB0E2888756c82E1038e4',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.ORVIN,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Puzzle Solving',
  tooltipText:
    '<p><strong>Puzzle Solving</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Wisdom tend to be more successful with the Puzzle Solving Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Well-played, ${heroName}! I haven't had such a skillful opponent in ages! I would be honored to play another round when you're ready. Here, take this as a reward.`,
    fair: `Ah! I was so close to finishing you off, ${heroName}! I'm glad I was able to put up a fight till the very end. Here's your reward for giving me a proper mental workout today!`,
    poor: `I saw that glimmer in your eye halfway through the match, ${heroName}! Haha! It wasn't enough to best me this time. It was a challenge, though! Thanks for making my gears turn a bit. Take this.`,
    bad: `Haha! Well ${heroName}, you tried your best. At least it killed some time. Come back when you've brushed up your skills.`
  }),
  prompts: ['Sit down Hero, test your mind with some games. Chess? Tower? Cards? You name it, I have it all.'],
  location: 'Castle',
  locationUrl: 'castle',
  trainingStat: 'wisdom',
  sceneImage: undefined
})
