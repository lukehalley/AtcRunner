import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import gardeningScene from 'assets/images/professions/quest-gardening.gif'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType, Professions } from '../types'

export const gardeningLevel0 = new Quest({
  key: QuestKeys.GARDENING_0,
  title: 'Gardening Quests',
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
    [ChainId.HARMONY_MAINNET]: '0xe4154B6E5D240507F9699C730a496790A722DF19',
    [ChainId.HARMONY_TESTNET]: '0x3bB67a48D39aB0CC69ebCC5F4e07DE8C74E7d389',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.DRUID_LAM,
  type: QuestType.LiquidityBased,
  level: 0,
  duration: 20,
  baseDuration: 12,
  proficientDuration: 10,
  baseStaminaCost: 1,
  proficientStaminaCost: 1,
  proficiencyType: Professions.GARDENING,
  minHeroes: 1,
  maxHeroes: 1,
  startQuestName: 'Gardening',
  tooltipText:
    '<p>For every twelve minutes spent, <strong>Gardening Quests</strong> yield JEWEL, a chance to increase the Hero’s Gardening skill, and experience toward the Hero’s next level. JEWEL rewards from Gardening are based on a number of factors including how many seeds you have planted in the garden, the garden’s JEWEL emissions rate, your Hero’s relevant stats, and the total available rewards for Gardening. The relevant stats are: Gardening profession skill level, the Gardening gene, Wisdom, and Vitality. Heroes who have Gardening as their main profession unlock their rewards every ten minutes, allowing them to harvest more quickly. Heroes can sometimes find plants or special items while Gardening.</p><p>The main Quest window displays the amount of Stamina that your Hero will expend per twelve minutes (or ten minutes, with <strong>Gardening</strong> skill) on this Quest. Any time spent after the Hero’s Stamina is depleted yields no rewards or experience, and you may choose to end the quest at any time to collect rewards earned up to that point. Only one Hero may work in each of your Garden pools at a time. The likelihood of an increase to a Hero’s Gardening profession skill will reduce the more the hero’s profession skill level exceeds the quest level.</p>',
  rewardsDialogueMap: {
    noRewardMessage:
      'The land has withheld its bounty from you today. Align your spirit with Gaia and try again tomorrow.',
    questFailedMessage:
      'The land has withheld its bounty from you today. Align your spirit with Gaia and try again tomorrow.',
    tearsComboMessage: 'Even in her grief, Gaia blessed us with the magic of her Tears! So beautiful…',
    runesComboMessage: 'A Shvas rune! Gaia was surely watching over you today!',
    tearsOrRunesOnlyMessage: 'No plants, but you found something even better!',
    eggMessage: 'Oh, you found a Green Egg! Surely a loyal and steadfast creature will come from this!'
  },
  prompts: [
    'If you wish to learn my skills, a gentle hand is required.',
    'The plants sense your energy and feed off of it. Come only with positive thoughts.',
    'I will show you how we tend our gardens. Do not betray my trust.'
  ],
  location: 'Professions',
  locationUrl: 'professions',
  sceneImage: gardeningScene,
  audio: 'https://defi-kingdoms.b-cdn.net/game-audio/fx/sfx_quest_gardening.ogg'
})
