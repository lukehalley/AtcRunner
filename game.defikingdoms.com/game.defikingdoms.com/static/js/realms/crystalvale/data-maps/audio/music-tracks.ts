import { Track, TrackMap } from 'features/audio/types'

const cradleTrack: Track = {
  fade: [0, 1, 4000],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/cradle-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/cradle-loop.mp3'
  ]
}
const docksTrack: Track = {
  fade: [0.2, 1, 7000],
  src: [
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/docks-loop.ogg',
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/docks-loop.mp3'
  ]
}
const gardensTrack: Track = {
  fade: [0.2, 1, 6000],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/gardens-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/gardens-loop.mp3'
  ]
}
const jewelerTrack: Track = {
  fade: [0, 1, 4000],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/jeweler-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/jeweler-loop.mp3'
  ]
}
const mapTrack: Track = {
  fade: [0, 1, 500],
  src: [
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/map-loop.ogg',
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/map-loop.mp3'
  ]
}
const marketplaceTrack: Track = {
  fade: [0.2, 1, 4000],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/marketplace-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/marketplace-loop.mp3'
  ]
}
const meditationTrack: Track = {
  src: [
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/meditation-loop.ogg',
    'https://defi-kingdoms.b-cdn.net/game-audio/crystalvale/meditation-loop.mp3'
  ]
}
const portalTrack: Track = {
  fade: [0.2, 1, 3000],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/portal-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/portal-loop.mp3'
  ]
}
const tavernTrack: Track = {
  fade: [0.2, 1, 2500],
  src: [
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/tavern-loop.ogg',
    'https://dfk-hv.b-cdn.net/game-audio/crystalvale/tavern-loop.mp3'
  ]
}

export const musicTracksMap: TrackMap = {
  '/': mapTrack,
  '/cradle': cradleTrack,
  '/docks': docksTrack,
  '/gardens': gardensTrack,
  '/jeweler': jewelerTrack,
  '/marketplace': marketplaceTrack,
  '/meditation': meditationTrack,
  '/portal': portalTrack,
  '/tavern': tavernTrack
}
