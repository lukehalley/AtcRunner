import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Web3Provider } from '@ethersproject/providers'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { landingZoneNavigation } from 'chains/landing-zones/Navigation'
import { outpostNavigation } from 'chains/outposts/Navigation'
import Polling from 'components/Header/Polling'
import Popups from 'components/Popups'
import Web3ReactManager from 'components/Web3ReactManager'
import Connect from 'components/_DeFiKingdoms/Connect'
import HamburgerMenu from 'components/_DeFiKingdoms/HamburgerMenu'
import JewelLoader from 'components/_DeFiKingdoms/JewelLoader'
import {
  AppWrapper,
  AudioPosition,
  BodyWrapper, // LanguagePosition,
  NavPosition,
  PollingPosition,
  PopupsPosition,
  ProfilePosition,
  StatusPosition
} from 'components/_DeFiKingdoms/MainWrapperStyledComponents'
import ProfileBox from 'components/_DeFiKingdoms/ProfileBox'
import TxnStatus from 'components/_DeFiKingdoms/TxnStatus'
import VolumeControl from 'components/_DeFiKingdoms/VolumeControl'
import AddressClaimModal from 'components/claim/AddressClaimModal'
import { landingZones, outposts, realms } from 'constants/chains'
import { ChainId } from 'constants/sdk-extra'
import { ApplicationModal } from 'features/application/actions'
import { useAllowedIp, useModalOpen, useToggleModal } from 'features/application/hooks'
import { useDispatch, useSelector } from 'features/hooks'
// import LanguageControl from 'features/i18n/components/LanguageControl'
import { fetchProfile, setBoredApeTokens } from 'features/profile/state'
import { ProfileCollection } from 'features/profile/types'
import { convertIPFSToken } from 'features/profile/utils'
import { setAccount, setChainId, setConnector, setLibrary } from 'features/web3'
import { useActiveWeb3React } from 'hooks'
import useGoogleAnalytics from 'hooks/analytics/useGoogleAnalytics'
import { useProfilesContract } from 'hooks/useContract'
import { useNotifications } from 'hooks/useNotifications'
import usePlatformName from 'hooks/usePlatformName'
import { crystalvaleNavigation } from 'realms/crystalvale/Navigation'
import { serendaleNavigation } from 'realms/serendale/Navigation'
import useDarkModeQueryParamReader from 'theme/useDarkModeQueryParamReader'
import { isDFKChainHook, isHarmonyHook } from 'utils'
import errorHandler from 'utils/errorHandler'

const SerendaleApp = lazy(() => import('realms/serendale/App'))
const CrystalvaleApp = lazy(() => import('realms/crystalvale/App'))
const LandingZoneRoutes = lazy(() => import('chains/landing-zones/Routes'))
const OutpostRoutes = lazy(() => import('chains/outposts/Routes'))

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export function ChainPicker(): JSX.Element {
  const platformName = usePlatformName()
  const allowedIp = useAllowedIp()
  useEffect(() => {
    document.title = platformName
  }, [platformName])

  useGoogleAnalytics()
  useDarkModeQueryParamReader()
  const dispatch = useDispatch()
  const { account, chainId, connector, library } = useActiveWeb3React()
  const { customCursor } = useSelector(s => s.preferences)
  const profilesCore = useProfilesContract()

  useEffect(() => {
    dispatch(setAccount(account as string))

    if (chainId && isHarmonyHook(chainId)) {
      getOwnedNFTs(account)
    }
  }, [account])

  useEffect(() => {
    dispatch(setChainId(chainId as ChainId))
  }, [chainId])

  useEffect(() => {
    dispatch(setConnector(connector as AbstractConnector))
  }, [connector])

  useEffect(() => {
    dispatch(setLibrary(library as Web3Provider))
  }, [library])

  useEffect(() => {
    if (account && chainId) {
      dispatch(fetchProfile({ id: account, chainId }))
    }
  }, [account, chainId])

  useNotifications()

  async function getOwnedNFTs(account: string | null | undefined) {
    const boredApes = []
    if (profilesCore && account) {
      try {
        const tokens = await profilesCore.getTokenUrisHeldByAddress(account, ProfileCollection.BORED_APE)
        for (const token of tokens) {
          const nftId = token.split('/').pop()
          const imageUri = await convertIPFSToken(token)
          boredApes.push({
            id: nftId,
            collectionId: 2,
            src: imageUri
          })
        }
        dispatch(setBoredApeTokens(boredApes))
      } catch (error) {
        errorHandler(error)
      }
    }
  }

  type Navigation = { label: string; path: string }
  type RoutesByChainIndex = { [index in ChainId]?: { app: JSX.Element; navigation: Navigation[] } }
  const landingZoneRoutes = {
    app: <LandingZoneRoutes />,
    navigation: landingZoneNavigation
  }
  const outpostRoutes = {
    app: <OutpostRoutes />,
    navigation: outpostNavigation
  }
  const crystalvaleRoutes = { app: <CrystalvaleApp />, navigation: crystalvaleNavigation }
  const serendaleRoutes = { app: <SerendaleApp />, navigation: serendaleNavigation }
  const routesByChain: RoutesByChainIndex = {
    [ChainId.MAINNET]: landingZoneRoutes,
    [ChainId.BSC_MAINNET]: landingZoneRoutes,
    [ChainId.BSC_TESTNET]: landingZoneRoutes,
    [ChainId.AVALANCHE_C_CHAIN]: outpostRoutes,
    [ChainId.AVALANCE_FUJI_TESTNET]: outpostRoutes,
    [ChainId.DFK_MAINNET]: crystalvaleRoutes,
    [ChainId.DFK_TESTNET]: crystalvaleRoutes,
    [ChainId.HARMONY_MAINNET]: serendaleRoutes,
    [ChainId.HARMONY_TESTNET]: serendaleRoutes
  }

  const unsupportedProfilePaths = ['/multichain-bridge', '/synapse-bridge']
  const location = useLocation()
  const isBlockchainReady = chainId && account && library

  function handleChainSelect() {
    if (isBlockchainReady) {
      if (routesByChain[chainId]) {
        return routesByChain[chainId as ChainId]
      } else if (landingZones.includes(chainId)) {
        return landingZoneRoutes
      } else {
        return { app: <Connect />, navigation: [] } // Lost chains - should offer to swap to another chain
      }
    } else {
      return { app: <Connect />, navigation: [] }
    }
  }

  return (
    <Suspense fallback={<JewelLoader />}>
      {allowedIp ? (
        <>
          <PopupsPosition>
            <Popups />
          </PopupsPosition>
          <AppWrapper customCursor={customCursor}>
            {isBlockchainReady && (
              <>
                {(isHarmonyHook(chainId) || isDFKChainHook(chainId)) &&
                  !unsupportedProfilePaths.includes(location.pathname) && (
                    <ProfilePosition>
                      <ProfileBox />
                    </ProfilePosition>
                  )}
                {(isHarmonyHook(chainId) || isDFKChainHook(chainId)) && (
                  <NavPosition>
                    <HamburgerMenu navigation={handleChainSelect()?.navigation || []} />
                  </NavPosition>
                )}
                <StatusPosition>
                  <TxnStatus />
                </StatusPosition>
              </>
            )}
            <BodyWrapper>
              <PollingPosition>
                <Polling />
              </PollingPosition>
              <TopLevelModals />
              {/* <LanguagePosition>
                <LanguageControl />
              </LanguagePosition> */}
              {chainId && (outposts.includes(chainId) || realms.includes(chainId)) && (
                <AudioPosition>
                  <VolumeControl />
                </AudioPosition>
              )}
              <Web3ReactManager>{handleChainSelect()?.app || <></>}</Web3ReactManager>
            </BodyWrapper>
          </AppWrapper>
        </>
      ) : allowedIp === null ? (
        <JewelLoader />
      ) : (
        <h2 style={{ textAlign: 'center', marginTop: '40vh' }}>
          Sorry, IP addresses in your location are not allowed to interact with the Defi Kingdoms game.
        </h2>
      )}
    </Suspense>
  )
}
