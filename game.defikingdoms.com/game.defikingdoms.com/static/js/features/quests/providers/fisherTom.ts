import { ItemKeys } from 'features/items/types'
import fishingNPC from 'assets/images/professions/profile-tom.png'
import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const fisherTom = new QuestProvider({
  name: 'Fisher Tom',
  description:
    "Have a sit. Got some drinks here if you want. It's a fine day for some company—besides the fish that is. They're always biting at this spot.",
  title: 'Fishing Quests',
  npcImage: fishingNPC,
  quests: [QuestKeys.FISHING_0],
  itemDialogueMap: {
    [ItemKeys?.BLOATER]: "Not bad! You're still learning, but these little guys sell for a little bit of gold.",
    [ItemKeys?.IRONSCALE]:
      "Ah, an Ironscale! You can sell that at market, but I've also heard that their tough scales can be used in other ways…",
    [ItemKeys?.LANTERNEYE]:
      "The creepiest fish of them all, the Lanterneye! Well, he'll sell for a bit of gold, but these fish have some connection to magic as well…",
    [ItemKeys?.REDGILL]:
      "Wow! It's not very common for a novice like you to catch a Redgill! It'll fetch a decent price at market.",
    [ItemKeys?.SAILFISH]:
      "Oh, isn't it beautiful? Sailfish are so majestic and so fast. Speaking of which, do you know anything about how to make Swiftness Potions?",
    [ItemKeys?.SHIMMERSKIN]:
      "This is the rarest fish of all, the Shimmerskin! I've never even caught one myself. I hear they're highly prized by Alchemists, but for what purpose, I don't know.",
    [ItemKeys?.SILVERFIN]:
      "Amazing! Gaia must be looking down on you today. A novice, catching a silverfin, in this little pond? Its fins might be silver but it's worth a chunk of gold!"
  }
})
