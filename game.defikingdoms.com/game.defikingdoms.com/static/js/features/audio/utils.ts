import store from 'features'

export const playSoundEffect = (src: string) => {
  const { fxVolume, fxMuted } = store.getState().audio
  const sound = new Audio(src)
  sound.volume = fxVolume
  sound.muted = fxMuted
  sound.play()
}
