import { useRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'features/hooks'
import usePrevious from 'hooks/usePrevious'
import { Howl } from 'howler'
import { TrackMap, Track } from './types'

export function useSoundTracks(routeTracksMap: TrackMap, volumeModifier?: number) {
  const [track, setTrack] = useState<Track>()
  const prevTrack = usePrevious(track?.src[0])
  const { pathname } = useLocation()
  const { volume, muted } = useSelector(s => s.audio)
  const songRef = useRef<Howl>()

  useEffect(() => {
    setTrack(routeTracksMap[pathname])
  }, [pathname])

  useEffect(() => {
    if (!track) return

    const song = new Howl({
      src: track.src,
      loop: true,
      mute: muted,
      volume: volumeModifier ? volumeModifier * volume : volume
    })

    song.once('load', () => {
      songRef.current = song
      song.play()
      if (track.fade) {
        const [start, end, dur] = track.fade.map(f => f * volume)
        song.fade(start, end, dur)
      }
    })

    return function cleanup() {
      if (prevTrack !== track.src[0]) {
        const currentVolume = song.volume()
        song.fade(currentVolume, 0, 500)
        song.once('fade', () => {
          song.unload()
        })
      }
    }
  }, [track])

  useEffect(() => {
    songRef.current?.volume(volumeModifier ? volumeModifier * volume : volume)
  }, [volume])

  useEffect(() => {
    if (muted) {
      songRef.current?.fade(volume, 0.0, 1000)
      setTimeout(() => {
        songRef.current?.mute(muted)
      }, 1000)
    } else {
      songRef.current?.mute(muted)
      songRef.current?.fade(0.0, volume, 1000)
    }
  }, [muted])
}
