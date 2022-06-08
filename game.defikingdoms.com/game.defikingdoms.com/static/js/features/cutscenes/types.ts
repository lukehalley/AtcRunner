import { Pathname } from 'react-router-dom'

export type Cutscene = { videoUrl: string; storageKey: string }
export type CutsceneMap = { [route: Pathname]: Cutscene }
export enum StorageKeys {
  cradle = 'watchedCradleVideo',
  portal = 'watchedPortalVideo'
}
