import { ItemKeys } from 'features/items/types'
import foragingNPC from 'assets/images/professions/profile-aurum.png'
import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const woodsmanAurum = new QuestProvider({
  name: 'Woodsman Aurum',
  description:
    'Many useful plants out in the wild hide themselves from the untrained eye. Do you have the knack for finding the medicinal ones…or the deadly ones? Both have their uses…',
  title: 'Foraging Quests',
  npcImage: foragingNPC,
  quests: [QuestKeys.FORAGING_0],
  itemDialogueMap: {
    [ItemKeys?.AMBERTAFFY]:
      "See how tough the stem on this plant is? Golden and flexible but hard to break, that's why they call it ambertaffy. Zada will take it off your hands, but it's also linked to toughness.",
    [ItemKeys?.DARKWEED]:
      "This is exactly why you have to search in the shady spots as well! Darkweed thrives without sunlight, and it can even help if you're blinded.",
    [ItemKeys?.GOLDVEIN]:
      'What a find! Looks like Gaia was watching out for you today. They named goldvein aptly; this is a valuable plant that will earn you plenty at the market.',
    [ItemKeys?.RAGWEED]:
      "Keep that ragweed away from your nose! It's the main cause of seasonal allergies here in the Kingdom, so you can turn it in for a bounty at the market. One day we'll eradicate it!",
    [ItemKeys?.REDLEAF]:
      "Good eye! There's a pretty good demand for those flowers in town. You can probably get a fair amount of gold for those.",
    [ItemKeys?.ROCKROOT]:
      "Oh, that's rockroot! It sells for a little gold, but the old wives say it can accelerate healing if it's used properly…",
    [ItemKeys?.SWIFT_THISTLE]:
      "I'm a huge fan of whoever named this plant. Swift-Thistle. It'll make you...hustle swiftly. I never learned how to make the potion, though."
  }
})
