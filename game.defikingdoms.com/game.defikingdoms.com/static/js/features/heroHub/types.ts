export enum ListType {
  owned = 'owned',
  available = 'available',
  catalog = 'catalog'
}

export enum HeroSlot {
  A = 'A',
  B = 'B'
}

export enum ActiveModalType {
  applyItem = 'applyItem',
  bridge = 'bridge',
  buy = 'buy',
  catalog = 'catalog',
  dead = 'dead',
  hire = 'hire',
  journey = 'journey',
  journeyChance = 'journeyChance',
  level = 'level',
  portal = 'portal',
  quest = 'quest',
  rent = 'rent',
  reroll = 'reroll',
  sell = 'sell',
  send = 'send',
  view = 'view'
}

export type ActiveModal = {
  activeModalType: ActiveModalType
  listType: ListType
  title: string
}
