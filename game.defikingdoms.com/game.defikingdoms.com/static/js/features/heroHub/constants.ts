import { ActiveModal, ActiveModalType, ListType } from './types'

export type HeroHubMap = {
  [key in ActiveModalType]: ActiveModal
}

export const heroHubMap: HeroHubMap = {
  [ActiveModalType.bridge]: {
    activeModalType: ActiveModalType.bridge,
    listType: ListType.owned,
    title: 'Select Heroes to Bridge'
  },
  [ActiveModalType.catalog]: {
    activeModalType: ActiveModalType.catalog,
    listType: ListType.catalog,
    title: 'Hero Catalog'
  },
  [ActiveModalType.view]: {
    activeModalType: ActiveModalType.view,
    listType: ListType.owned,
    title: 'Your Heroes'
  },
  [ActiveModalType.applyItem]: {
    activeModalType: ActiveModalType.applyItem,
    listType: ListType.owned,
    title: 'Apply Potion'
  },
  [ActiveModalType.quest]: {
    activeModalType: ActiveModalType.quest,
    listType: ListType.owned,
    title: 'Select Questing Hero'
  },
  [ActiveModalType.journey]: {
    activeModalType: ActiveModalType.journey,
    listType: ListType.owned,
    title: 'Select Your Hero'
  },
  [ActiveModalType.journeyChance]: {
    activeModalType: ActiveModalType.journeyChance,
    listType: ListType.owned,
    title: 'Select Your Hero'
  },
  [ActiveModalType.portal]: {
    activeModalType: ActiveModalType.portal,
    listType: ListType.owned,
    title: 'Select Your Hero'
  },
  [ActiveModalType.hire]: {
    activeModalType: ActiveModalType.hire,
    listType: ListType.available,
    title: 'Hire a Hero'
  },
  [ActiveModalType.level]: {
    activeModalType: ActiveModalType.level,
    listType: ListType.owned,
    title: 'Select Your Hero'
  },
  [ActiveModalType.send]: {
    activeModalType: ActiveModalType.send,
    listType: ListType.owned,
    title: 'Select Your Hero'
  },
  [ActiveModalType.buy]: {
    activeModalType: ActiveModalType.buy,
    listType: ListType.available,
    title: 'Buy Heroes'
  },
  [ActiveModalType.sell]: {
    activeModalType: ActiveModalType.sell,
    listType: ListType.owned,
    title: 'Sell Heroes'
  },
  [ActiveModalType.rent]: {
    activeModalType: ActiveModalType.rent,
    listType: ListType.owned,
    title: 'Rent Heroes'
  },
  [ActiveModalType.reroll]: {
    activeModalType: ActiveModalType.reroll,
    listType: ListType.owned,
    title: 'Gen0 Heroes'
  },
  [ActiveModalType.dead]: {
    activeModalType: ActiveModalType.dead,
    listType: ListType.owned,
    title: 'Dead Heroes'
  }
}
