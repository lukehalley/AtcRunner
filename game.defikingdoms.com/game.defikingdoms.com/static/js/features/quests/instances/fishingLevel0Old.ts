import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import fishingScene from 'assets/images/professions/quest-fishing.gif'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType, Professions } from '../types'

export const fishingLevel0Old = new Quest({
  key: QuestKeys.FISHING_0,
  title: 'Fishing Quests',
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
    [ChainId.HARMONY_MAINNET]: '0xE259e8386d38467f0E7fFEdB69c3c9C935dfaeFc',
    [ChainId.HARMONY_TESTNET]: '0x6499E23D00092bcf8d9F0A9eEae5b823bD1a5E69',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.FISHER_TOM,
  type: QuestType.TimeBased,
  level: 0,
  duration: 20,
  baseStaminaCost: 7,
  proficientStaminaCost: 5,
  proficiencyType: Professions.FISHING,
  minHeroes: 1,
  maxHeroes: 6,
  startQuestName: 'Fishing',
  tooltipText:
    '<p><strong>Fishing Quests</strong> may yield a variety of rewards including various fish, special items, experience toward the Fishing skill, and experience toward your Hero’s next level. Heroes with higher Fishing, Agility, and Luck scores tend to be more successful on Fishing Quests, and Heroes who have Fishing as their main skill expend a reduced amount of Stamina to complete the Quest.</p><p>The main Quest window displays the amount of Stamina that each Hero will expend on this Quest. The total number of attempts defaults to the highest possible number based on the available Stamina of the selected Heroes. It also displays the minimum time required to complete the Quest, which increases as multiple Heroes join the Quest together. The likelihood of an increase to a Hero’s Fishing profession skill will reduce the more the hero’s profession skill level exceeds the quest level.</p>',
  rewardsDialogueMap: {
    noRewardMessage:
      'Just junk and litter, eh? Sometimes I wonder if being so near to the mines has an impact on this water.',
    questFailedMessage:
      'Well, you may have lost your line and broken your rod in two, but tomorrow’s a new day! Don’t worry, I’m sure the fish will be biting better by then.',
    tearsComboMessage: 'Wait, is there something caught in between the scales there? Is that...Gaia’s Tear?',
    runesComboMessage: 'Hold on, I think there’s something in its mouth. Let me take a look...that’s a Shvās Rune!',
    tearsOrRunesOnlyMessage: 'Well, no fish, but at least you found something good!',
    eggMessage:
      'Now how in the world did you catch an egg? No matter. This is an amazing find! Soon you’ll be able to hatch this egg to find an aquatic pet of some kind.'
  },
  prompts: [
    'This pond is a great place for new fishermen to...get their feet wet. Why don’t you go ahead and see what you can catch?',
    'Ready to dip your toes into fishing? A moment to learn, a lifetime to master, as they say. Give it a try!',
    'Despite its small size, sometimes you can catch some pretty nice fish in this pond. Let’s see what kind of luck you’ll have today.',
    'I love fishing! It’s a relaxing way to pass the time, enjoy Gaia’s bounty, and earn some JEWEL, too. Want to join me?'
  ],
  location: 'Professions',
  locationUrl: 'professions',
  sceneImage: fishingScene,
  audio: 'https://defi-kingdoms.b-cdn.net/game-audio/fx/sfx_quest_fishing.ogg'
})
