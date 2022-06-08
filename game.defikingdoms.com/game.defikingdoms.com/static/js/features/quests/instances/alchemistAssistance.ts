import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const alchemistAssistance = new Quest({
  key: QuestKeys.ALCHEMIST_ASSISTANCE,
  title: 'Alchemist Assistance',
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
    [ChainId.HARMONY_MAINNET]: '0x6176EedE1AE9127D59266f197Ad598653E4F8c92',
    [ChainId.HARMONY_TESTNET]: '0xDD53015F6ef6CebC9425BdDB7A1d9242F3f63576',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.ARNOLD,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Alchemist Assistance',
  tooltipText:
    '<p><strong>Alchemist Assistance</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Intelligence tend to be more successful with the Alchemist Assistance Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `Impressive! Herbert will be brewing potion batches all day with how organized you made it in here. Here's your pay, ${heroName}.`,
    fair: `Nicely done, ${heroName}. Herbert won't be tripping over books every time he needs to look for an old recipe. Here's a reward for you.`,
    poor: `That took you some time to finish that shelf, ${heroName}. I've finished the rest already. Here, you can take this for your effort.`,
    bad: `Fell asleep, ${heroName}? Well, you can go. I already put everything in its place.`
  }),
  prompts: [
    'Excuse the mess. Herbert was never one to organize. Would you mind helping clean up? We’ve got so many great ideas and too few hands to go around. Maybe I can teach you a thing or two as we sort through?'
  ],
  location: 'Alchemist',
  locationUrl: 'alchemist',
  trainingStat: 'intelligence',
  sceneImage: undefined
})
