import { Cutscene, CutsceneMap, StorageKeys } from 'features/cutscenes/types'

const cradleCutscene: Cutscene = {
  videoUrl: '692004702',
  storageKey: StorageKeys.cradle
}

const portalCutscene: Cutscene = {
  videoUrl: '704392263',
  storageKey: StorageKeys.portal
}

export const cutscenesRouteMap: CutsceneMap = {
  '/cradle': cradleCutscene,
  '/portal': portalCutscene
}
