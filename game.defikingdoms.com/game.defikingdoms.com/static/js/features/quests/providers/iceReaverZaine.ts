import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const iceWeaverZaine = new QuestProvider({
  name: 'Ice Reaver Zaine',
  nameTag: 'Ice Reaver',
  description:
    "I have conquered the unforgiving seas and here I shall conquer your mightiest of soldiers! Challenge me, Serendale! I'm itching to show my strength!",
  title: 'Arm Wrestling',
  npcImage: undefined,
  quests: [QuestKeys.ARM_WRESTLE],
  itemDialogueMap: {}
})
