import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const armWrestling = new Quest({
  key: QuestKeys.ARM_WRESTLE,
  title: 'Arm Wrestling',
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
    [ChainId.HARMONY_MAINNET]: '0xf60AF3a32Bb94e395E17C70aB695d968F37Bd2e4',
    [ChainId.HARMONY_TESTNET]: '0x2f5b9590B22479219532071388FCC299Fa29CFE7',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.ICE_REAVER_ZAINE,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Arm Wrestling',
  tooltipText:
    '<p><strong>Arm Wrestling</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Strength tend to be more successful with the Arm Wrestling Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Wow! You are a Hero after all, ${heroName}! It's an honor facing someone of your strength. Here's your reward. you've earned it!`,
    fair: `You should be proud! It's rare for someone to overpower an ice reaver! ${heroName}, take this as a reward.`,
    poor: `Haha! Nice try! You still have some work to do to beat these muscles, ${heroName}. Here's your reward for trying. I'm looking forward to our next match!`,
    bad: `Ah, perhaps next time, ${heroName}. As they say, no shame in losing to an ice reaver!`
  }),
  prompts: [
    'Looking to test your <strong>strength</strong> in an arm-wrestling battle? I’ll warn you, I’m one of the few that survived the voyage from Crystalvale. Us ice reavers don’t come from a soft life like the one you’ve got here in Serendale! Ahahaha!'
  ],
  location: 'Tavern',
  locationUrl: 'tavern',
  trainingStat: 'strength',
  sceneImage: undefined
})
