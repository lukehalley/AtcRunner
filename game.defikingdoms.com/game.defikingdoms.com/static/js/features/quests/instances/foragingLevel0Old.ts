import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import foragingScene from 'assets/images/professions/quest-foraging.gif'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType, Professions } from '../types'

export const foragingLevel0Old = new Quest({
  key: QuestKeys.FORAGING_0_OLD,
  title: 'Foraging Quests',
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
    [ChainId.HARMONY_MAINNET]: '0x3132c76acF2217646fB8391918D28a16bD8A8Ef4',
    [ChainId.HARMONY_TESTNET]: '0x91b4a64958e632b8da517CD4754Ec8fc40417207',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.WOODSMAN_AURUM,
  type: QuestType.TimeBased,
  level: 0,
  duration: 20,
  baseStaminaCost: 7,
  proficientStaminaCost: 5,
  proficiencyType: Professions.FORAGING,
  minHeroes: 1,
  maxHeroes: 6,
  startQuestName: 'Foraging',
  tooltipText:
    '<p><strong>Foraging Quests</strong> may yield a variety of rewards including various plants, special items, experience toward the Foraging skill, and experience toward your Hero’s next level. Heroes with higher Foraging, Dexterity, and Intelligence scores tend to be more successful on Foraging Quests, and Heroes who have Foraging as their main skill expend a reduced amount of Stamina to complete the Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend on this Quest. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. The likelihood of an increase to a Hero’s Foraging profession skill will reduce the more the hero’s profession skill level exceeds the quest level.</p>',
  rewardsDialogueMap: {
    noRewardMessage:
      'Just trash and litter, huh? Well, at least we cleaned up the forest a little bit. When will people learn to be more respectful of the environment?',
    questFailedMessage:
      'I’m glad I found you out here before the wild animals did. Dusk is approaching and the forest can be unforgiving. Don’t worry though, there’s always tomorrow.',
    tearsComboMessage:
      'Oh, look at the shimmering! Gaia’s love is still impacting the world today. Heroes coming from the Portal! I still remember the dark days before...',
    runesComboMessage:
      'Oh, and you found a special rock, too! I hear these are very useful, but I never cared much for the minerals, myself. It’s the living things I like!',
    tearsOrRunesOnlyMessage: 'No plants, but you found something even better!',
    eggMessage:
      'Ah, you found yourself an egg! Soon enough, you’ll be able to hatch that. I wonder what forest creature will appear? I’m hoping for a snake, myself.'
  },
  prompts: [
    'If you’re searching for something to do, why not search these woods and see if you can find anything useful?',
    'You look like you’ve got a keen eye and an observant mind. Why not have a look through the forest and see what you find?',
    'Contrary to what the Druids would have you believe, not all valuable plants can be grown in a Garden. Let’s see if we can find some out here.',
    'This forest is full of ragweed, but sometimes I find more valuable plants. Would you like to join me?'
  ],
  location: 'Professions',
  locationUrl: 'professions',
  sceneImage: foragingScene,
  audio: 'https://defi-kingdoms.b-cdn.net/game-audio/fx/sfx_quest_foraging.ogg'
})
