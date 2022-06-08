import { ZERO_ONE_ADDRESS } from 'constants/index'
import { ChainId } from 'constants/sdk-extra'
import miningScene from 'assets/images/professions/quest-mining.gif'
import { Quest } from '../Quest'
import { QuestKeys, QuestProviderKeys, QuestType, Professions } from '../types'

export const jewelMiningLevel0 = new Quest({
  key: QuestKeys.JEWEL_MINING_0,
  title: 'JEWEL Mining',
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
    [ChainId.HARMONY_MAINNET]: '0x6FF019415Ee105aCF2Ac52483A33F5B43eaDB8d0',
    [ChainId.HARMONY_TESTNET]: '0x48B9FB9da467f0169BE602c4356b63fe6A645619',
    [ChainId.HARDHAT]: ZERO_ONE_ADDRESS
  },
  provider: QuestProviderKeys.QUARRYSMITH_GREN,
  type: QuestType.TimeBased,
  level: 0,
  duration: 20,
  baseStaminaCost: 1,
  proficientStaminaCost: 1,
  baseDuration: 12,
  proficientDuration: 10,
  proficiencyType: Professions.MINING,
  minHeroes: 1,
  maxHeroes: 6,
  startQuestName: 'JEWEL mining',
  tooltipText:
    '<p><strong>JEWEL Mining Quests</strong> can be performed by a party of anywhere between 1 and 6 Heroes at a time. Heroes can be queued to begin questing as soon as the Stamina of the currently questing Heroes is expended; however, the party of Heroes will all stop mining as soon as any Hero’s Stamina reaches zero. Additionally, once a party of any size enters the mine, additional miners cannot be added to the party. Those Heroes will be queued and will not commence their quest until one Hero in the previous party reaches 0 Stamina, causing the entire party to stop mining, or until the player ends the mining quest early.</p><p><strong>JEWEL mining quests</strong> require the player to select a <strong>lead miner</strong>. The maximum amount of JEWEL that can be unlocked in the quest is determined by the stats of the <strong>lead miner</strong>: the Hero’s <strong>STR</strong> and <strong>END</strong> scores, <strong>mining</strong> skill, and whether they have <strong>mining</strong> as their main profession all impact the max amount that can be unlocked. When a <strong>lead miner</strong> is selected, the maximum unlockable JEWEL for the party and the amount of JEWEL that can be unlocked by the <strong>lead miner</strong> alone will be displayed.</p><p>Up to five further Heroes can be added to the mining party to assist the <strong>lead miner</strong>. Their contribution to the party will be based on their <strong>STR</strong> and <strong>END</strong> scores, <strong>mining</strong> score and on whether the Hero has <strong>mining</strong> as their main profession. As individual Heroes are added to the party, the total amount of JEWEL that the party can unlock will update. Once the group’s total unlockable amount reaches the maximum unlockable amount, adding further Heroes will not increase rewards further.</p><p>Heroes with <strong>mining</strong> as their main profession expend 1 Stamina every 10 minutes, and all other Heroes expend 1 Stamina per 12 minutes. However, if a party of Miners contains Heroes that do <em>not</em> have <strong>mining</strong> as their main profession, all Heroes in that party will expend at the 1 Stamina per 12 minutes rate. It is important to strategically group miners to achieve maximum rewards.</p><p>Mining quests also have a chance to reward Heroes with <strong>Gaia’s Tears</strong>, <strong>Shvās runes</strong>, and <strong>Yellow Eggs</strong>. Item drop rates are increased by varying combinations of <strong>STR</strong>, <strong>END</strong>, the <strong>mining</strong> stat, and the <strong>mining</strong> gene.</p>',
  rewardsDialogueMap: {
    noRewardMessage:
      'Hard luck, coming back from a day of digging, covered with soot and nothing to show for it but calloused hands and a weary body.',
    questFailedMessage:
      'Hard luck, coming back from a day of digging, covered with soot and nothing to show for it but calloused hands and a weary body.',
    tearsComboMessage:
      'Even more beautiful than gold and Jewels! More Tears mean more Heroes, and that’s always a good thing!',
    runesComboMessage:
      'Look at it pulsating! That humming reminds me of the sound of my pickaxe chipping away at a solid piece of ore.',
    tearsOrRunesOnlyMessage: 'It’s not ore exactly but might be even more valuable.',
    eggMessage:
      'Well well, looks like you dug up an egg. That’s a great find, but be careful. No one really knows what sort of creatures live down in those mines.'
  },
  prompts: [
    'These mines are full of rich veins of JEWEL. Let me show you!',
    'Ready to put in a hard day’s work, youngster? Then let’s get to it!',
    'No one ever earned JEWEL just sitting around! Let’s get to work.'
  ],
  location: 'Professions',
  locationUrl: 'professions',
  sceneImage: miningScene,
  audio: 'https://defi-kingdoms.b-cdn.net/game-audio/fx/sfx_quest_mining.ogg'
})
