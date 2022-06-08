import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType } from '../types'

export const helpingTheFarm = new Quest({
  key: QuestKeys.HELPING_THE_FARM,
  title: 'Helping the Farm',
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
    [ChainId.HARMONY_MAINNET]: '0x2174bBeFbEFBD766326a7C7538f93a78Db3eD449',
    [ChainId.HARMONY_TESTNET]: '0x89e465a433B0DFDd03A66eEFEE79c52F8aD5C3c9',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.FARMER_QUILL,
  type: QuestType.AttemptBasedTraining,
  level: 1,
  duration: 20,
  baseStaminaCost: 5,
  proficientStaminaCost: 5,
  minHeroes: 1,
  maxHeroes: 6,
  maxAttempts: 5,
  startQuestName: 'Helping the Farm',
  tooltipText:
    '<p><strong>Helping the Farms</strong> may yield a variety of rewards including gold, Attunement Crystals, Runes, Pages of the Eternal Story, and experience toward your Hero’s next level. Heroes with higher Vitality tend to be more successful with the Helping the Farms Training Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. If a Hero is too strong for their opponent, they’ll need to seek out the next level of Training Quests.</p>',
  performanceDialogueMap: (heroName: string) => ({
    good: `I bet you could do that all day! Thank you so much, ${heroName}. Everything arrived in such good condition that we got more than expected. Here's your pay with some bonus. When you work with me, my success is yours!`,
    fair: `That was well worth the sweat! Thanks for helping out, ${heroName}. Here's your pay in full today.`,
    poor: `We still made a profit today, but we could have made more with that load you dropped. Sorry ${heroName}, I'll need to cut your pay. Here's what I can give you.`,
    bad: `Heh, they don't make Heroes like they used to. I'll take that load off your shoulder, ${heroName}.`
  }),
  prompts: ['Occasionally I need to haul more than what I’m capable of. Care to help a friend move goods to the city?'],
  location: 'Gardens',
  locationUrl: 'gardens',
  trainingStat: 'vitality',
  sceneImage: undefined
})
