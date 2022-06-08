import { useEffect } from 'react'
import AirdropModal from 'components/_DeFiKingdoms/AirdropModal'
import BetaBanner from 'components/_DeFiKingdoms/BetaBanner/index'
import HeroHub from 'components/_DeFiKingdoms/HeroHub'
import InventoryModal from 'components/_DeFiKingdoms/InventoryModal'
import { setAirdropsDefaults } from 'features/airdrops'
import { useSoundTracks } from 'features/audio/hooks'
import { useInitCutscenes } from 'features/cutscenes/hooks'
import { useInitHeroes } from 'features/heroes/init'
import { useDispatch, useSelector } from 'features/hooks'
import { useInitItems } from 'features/items/init'
import { fetchProfileHeroes } from 'features/profile/init'
import { useActiveWeb3React } from 'hooks'
import { isDFKChainHook } from 'utils'
import { fetchAirdrops } from 'utils/airdrops'
import { CrystalvaleRoutes } from './Routes'
import { musicTracksMap } from './data-maps/audio/music-tracks'
import { cutscenesRouteMap } from './data-maps/cutscenes/cutscene-routes'

export function CrystalvaleApp() {
  const dispatch = useDispatch()
  const { account, chainId } = useActiveWeb3React()
  const { showHeroHub } = useSelector(s => s.heroHub)

  useSoundTracks(musicTracksMap)
  useInitCutscenes(cutscenesRouteMap)
  useInitHeroes()
  useInitItems()

  useEffect(() => {
    if (isDFKChainHook(chainId)) {
      fetchAirdrops()
      fetchProfileHeroes(account)
    }

    return () => {
      dispatch(setAirdropsDefaults())
    }
  }, [account, chainId])

  return (
    <div>
      <CrystalvaleRoutes />
      <BetaBanner />
      <InventoryModal />
      {showHeroHub && <HeroHub />}
      <AirdropModal />
    </div>
  )
}

export default CrystalvaleApp
