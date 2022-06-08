import { lazy, useEffect, useState } from 'react'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CuteJewel from 'components/CuteJewel'
import GoldIcon from 'components/GoldIcon'
import Loader from 'components/Loader'
import { useBlockPropagation } from 'components/Phaser/utils'
import { SuspenseWrapper } from 'components/SuspenseWrapper'
import ProfileCreation from 'components/_DeFiKingdoms/ProfileCreation'
import { GOVERNANCE_TOKEN_INTERFACE } from 'constants/abis/governanceToken'
import { TokenAmount } from 'constants/sdk-extra'
import { ChainId } from 'constants/sdk-extra'
import { setShowAirdropsModal } from 'features/airdrops'
import { getHeroById } from 'features/heroes/api'
import { useDispatch, useSelector } from 'features/hooks'
import { setInventoryOpen } from 'features/items/state'
import { setProfileDetailsOpen } from 'features/preferences/state'
import { ProfileCollection } from 'features/profile/types'
import { setShowActiveQuestModal } from 'features/quests/state'
import { useTokenBalance } from 'features/wallet/hooks'
import { useActiveWeb3React } from 'hooks'
import useBUSDPrice from 'hooks/useBUSDPrice'
import useGovernanceToken from 'hooks/useGovernanceToken'
import styled from 'styled-components/macro'
import { isDFKChainHook } from 'utils'
import themeColors from 'utils/colors'
import activeQuestIcon from 'assets/images/active-quest.png'
import inventoryChest from 'assets/images/inventory-icon.svg'
import profileBorder from 'assets/images/profile-pics/pBorder.png'
import Modal from '../../Modal'
import { MouseoverTooltip } from '../../Tooltip'
import HeroProfile from '../Heroes/components/HeroProfile'
import noProfileFullCV from './images/blank-profile-cv.png'
import profileBorderCV from './images/border-cv.png'
import noProfilePicCV from './images/no-profile-silhouette.png'
import noProfilePic from './images/no-profile-silhouette.png'
import underConstructionPic from './images/under-construction.png'

const GovTokenBalanceContent = lazy(() => import('../../Header/GovTokenBalanceContent'))

export default function ProfileBox() {
  useBlockPropagation('.profile-box')
  const dispatch = useDispatch()
  const { profile, profileLoading } = useSelector(s => s.profile)
  const { account, chainId } = useActiveWeb3React()
  const govToken = useGovernanceToken()
  const { goldBalance } = useSelector(s => s.items)
  const { airdrops } = useSelector(s => s.airdrops)
  const { profileDetailsOpen } = useSelector(s => s.preferences)
  const [showJewelBalanceModal, setShowJewelBalanceModal] = useState(false)
  const [heroProfileData, setHeroProfileData] = useState<any>(null)
  const [profileCreationOpen, setProfileCreationOpen] = useState(false)

  useEffect(() => {
    getHeroData()
  }, [profile, account, chainId])

  const formattedGold = goldBalance && goldBalance.toFixed(3)
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const govTokenTotalBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'totalBalanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )

  const govTokenLockedBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'lockOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const govTokenPrice = useBUSDPrice(govToken)
  const tooltips: Record<string, string> = {
    lockedBalance: 'Locked balance. See whitepaper for unlocking timeline.'
  }

  const getHeroData = async () => {
    if (profile) {
      if (profile.collectionId === ProfileCollection.HERO) {
        const heroData = await getHeroById(profile.nftId.toString())
        if (heroData.length) {
          return setHeroProfileData(heroData[0])
        }
      }
    }
    return setHeroProfileData(null)
  }

  const availableBalance = (
    <MouseoverTooltip
      text={
        govTokenPrice && govTokenBalance && govTokenBalance.greaterThan('0')
          ? `USD: $${govTokenBalance.multiply(govTokenPrice?.raw).toSignificant(6, { groupSeparator: ',' })}`
          : ''
      }
    >
      <span>{govTokenBalance?.toFixed(2, { groupSeparator: ',' })}</span>
    </MouseoverTooltip>
  )

  const lockedBalance = (
    <JewelBalanceInlineStyled>
      <MouseoverTooltip text={tooltips.lockedBalance}>
        <h4>Locked Balance:</h4>
      </MouseoverTooltip>

      <MouseoverTooltip
        text={
          govTokenPrice && govTokenLockedBalance && govTokenLockedBalance.greaterThan('0')
            ? `USD: $${govTokenLockedBalance.multiply(govTokenPrice?.raw).toSignificant(6, { groupSeparator: ',' })}`
            : ''
        }
      >
        <span>
          <CuteJewel style={{ width: 12 }} />
          {govTokenLockedBalance?.toFixed(2, { groupSeparator: ',' })}
        </span>
      </MouseoverTooltip>
    </JewelBalanceInlineStyled>
  )

  const totalBalance = (
    <JewelBalanceInlineStyled>
      <h4>Total Balance:</h4>

      <MouseoverTooltip
        text={
          govTokenPrice && govTokenTotalBalance && govTokenTotalBalance.greaterThan('0')
            ? `USD: $${govTokenTotalBalance.multiply(govTokenPrice?.raw).toSignificant(6, { groupSeparator: ',' })}`
            : ''
        }
      >
        <span>
          <CuteJewel style={{ width: 12 }} />
          {govTokenTotalBalance?.toFixed(2, { groupSeparator: ',' })}
        </span>
      </MouseoverTooltip>
    </JewelBalanceInlineStyled>
  )

  const supportingData = (
    <div className="supporting-data">
      <hr style={{ borderColor: 'rgba(255,255,255,.25)' }} />
      {lockedBalance}
      {totalBalance}
    </div>
  )

  const ChainProfileBoxStyled = isDFKChainHook(chainId) ? ProfileBoxStyledCV : ProfileBoxStyled
  const ChainProfileFrame = isDFKChainHook(chainId) ? ProfilePicFrameCV : ProfilePicFrame

  return (
    <>
      <Modal isOpen={showJewelBalanceModal} onDismiss={() => setShowJewelBalanceModal(false)}>
        <SuspenseWrapper>
          <GovTokenBalanceContent
            setShowJewelBalanceModal={setShowJewelBalanceModal}
            setProfileCreationOpen={setProfileCreationOpen}
          />
        </SuspenseWrapper>
      </Modal>
      <ChainProfileBoxStyled className={profileDetailsOpen ? 'visible' : 'hidden'}>
        {profileLoading ? (
          <ProfileBoxImageStyled onClick={() => setShowJewelBalanceModal(true)}>
            <ChainProfileFrame />
            <LoadWrapper>
              <Loader stroke="rgb(127, 115, 108" size="36px" />
            </LoadWrapper>
          </ProfileBoxImageStyled>
        ) : profile ? (
          <ProfileBoxImageStyled
            onClick={() => setShowJewelBalanceModal(true)}
            boredApe={profile.collectionId === ProfileCollection.BORED_APE}
          >
            <ChainProfileFrame />
            {profile.collectionId === ProfileCollection.HERO && heroProfileData ? (
              <HeroProfile hero={heroProfileData} profileChoice />
            ) : (
              <img src={profile.picUri || noProfilePicCV} alt="" />
            )}
          </ProfileBoxImageStyled>
        ) : isDFKChainHook(chainId) && !profile ? (
          <ProfileBoxImageStyled onClick={() => setShowJewelBalanceModal(true)}>
            <NoProfileUnderConstruction />
            <NoProfilePicFrameCV />
          </ProfileBoxImageStyled>
        ) : (
          <ProfileBoxImageStyled onClick={() => setShowJewelBalanceModal(true)}>
            <ChainProfileFrame />
            <img src={noProfilePic} alt="" />
          </ProfileBoxImageStyled>
        )}
        <HideProfileButton onClick={() => dispatch(setProfileDetailsOpen(!profileDetailsOpen))}>
          {profileDetailsOpen ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
        </HideProfileButton>
        <ProfileTextStyled
          className={`${isDFKChainHook(chainId) ? 'bordered-box-thin-cv' : 'bordered-box-thin'} ${
            profileDetailsOpen ? 'visible' : 'hidden'
          }`}
        >
          {!profileLoading && <ProfileNameStyled>{profile ? profile.name : 'Traveler'}</ProfileNameStyled>}
          <JewelBalanceStyled>
            <div className="img-wrapper">
              <CuteJewel style={{ width: 13 }} />
            </div>
            {availableBalance} {isDFKChainHook(chainId) ? 'CRYSTAL' : 'JEWEL'}
          </JewelBalanceStyled>
          {!isDFKChainHook(chainId) && (
            <InventoryRow onClick={() => dispatch(setInventoryOpen(true))}>
              <div className="img-wrapper">
                <GoldIcon />
              </div>
              <h4>{formattedGold || 0} Gold</h4>
            </InventoryRow>
          )}
          <InventoryRow onClick={() => dispatch(setInventoryOpen(true))}>
            <div className="img-wrapper">
              <InventoryImage src={inventoryChest} alt="" />
            </div>
            <h4>Inventory</h4>
          </InventoryRow>
          {!isDFKChainHook(chainId) && (
            <InventoryRow onClick={() => dispatch(setShowActiveQuestModal(true))}>
              <div className="img-wrapper">
                <InventoryImage src={activeQuestIcon} alt="" />
              </div>
              <h4>Active Quests</h4>
            </InventoryRow>
          )}
          {airdrops.length > 0 && (
            <>
              <InventoryRow onClick={() => dispatch(setShowAirdropsModal(true))} className="airdrop-button">
                <hr style={{ borderColor: 'rgba(255,255,255,.25)' }} />
                <h4>Claim Airdrop{airdrops.length > 1 && 's'}</h4>
              </InventoryRow>
            </>
          )}
          {supportingData}
        </ProfileTextStyled>
      </ChainProfileBoxStyled>
      <ProfileCreation closeModal={() => setProfileCreationOpen(false)} showModal={profileCreationOpen} />
    </>
  )
}

const ProfileBoxStyled = styled.div.attrs<{ className: string }>(props => ({
  className: 'profile-box'
}))`
  width: 200px;
  text-align: center;
  transition: all 0.2s ease-in-out;

  &.hidden {
    width: 96px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    max-width: 270px;
    display: flex;
    flex-flow: row nowrap;

    &.hidden {
      left: 0;
      width: auto;
      position: relative;
    }
  `};
`

const ProfileBoxStyledCV = styled.div.attrs<{ className: string }>(props => ({
  className: 'profile-box'
}))`
  width: 200px;
  text-align: center;
  transition: all 0.2s ease-in-out;

  &.hidden {
    width: 118px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    max-width: 270px;
    display: flex;
    flex-flow: row nowrap;

    &.hidden {
      left: 0;
      width: auto;
      position: relative;
    }
  `};
`

const ProfileBoxImageStyled = styled.button<{ boredApe?: boolean }>`
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  position: relative;
  z-index: 1;
  border: 0;
  background-color: unset;
  border-radius: 20px;

  > img {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${({ boredApe }) => (boredApe ? '90px' : '80px')};
    image-rendering: ${({ boredApe }) => (boredApe ? 'auto' : '-moz-crisp-edges')};
    image-rendering: ${({ boredApe }) => (boredApe ? 'auto' : 'pixelated')};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 96px;
    max-width: 96px;
    margin-left: 0;
    margin-right: 0;
  `};
`

const ProfilePicFrame = styled.div<{ chainId?: ChainId }>`
  position: relative;
  width: 96px;
  height: 100px;
  background: url(${profileBorder});
  background-size: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  z-index: 1; ;;;;
`

const ProfilePicFrameCV = styled.div<{ chainId?: ChainId }>`
  position: relative;
  width: 96px;
  height: 100px;
  background: url(${profileBorderCV});
  background-size: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  z-index: 1; ;;;;
`

const NoProfileUnderConstruction = styled.div`
  background-color: none;
  position: absolute;
  width: 116px;
  height: 94px;
  left: -12px;
  background: url(${underConstructionPic});
  background-size: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 96px;
    height: 74px;
    left: -4px;
    top: 10px;
  `};
`

const NoProfilePicFrameCV = styled.div`
  background-color: none;
  position: relative;
  width: 96px;
  height: 100px;
  background: url(${noProfileFullCV});
  background-size: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  z-index: 1;
`

const ProfileTextStyled = styled.div`
  margin-top: -40px;
  padding-top: 45px;
  position: relative;
  opacity: 1;
  height: 100%;
  width: 200px;
  overflow: hidden;
  transition: opacity 0.25s ease-in-out, margin-top 0.25s ease-in-out;

  &.hidden {
    opacity: 0;
    margin-top: -80px;
    height: 0;
    width: 0;
    transition: opacity 0.25s ease-in-out, margin-top 0.25s ease-in-out, height 0.25s 0.25s ease-in-out,
      width 0.25s 0.25s ease-in-out;
  }

  .img-wrapper {
    display: flex;
    align-items: center;
    width: 20px;
    text-align: center;
    margin-right: 6px;

    img {
      margin: 0 auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 2px;
    padding: 0 0 5px 10px;
    margin-left: -4px;
    transition: opacity 0.25s ease-in-out, margin-left 0.25s ease-in-out;
    width: 100%;

    .supporting-data {
      display: none;
    }

    &.hidden {
      margin-top: 2px;
      margin-left: -40px;
      transition: opacity 0.25s ease-in-out, margin-left 0.25s ease-in-out, height 0.25s 0.25s ease-in-out,
      width 0.25s ease-in-out;
    }
  `};
`

const ProfileNameStyled = styled.div`
  color: white;
  margin: 5px 0;
  padding: 0;
  text-shadow: 1px rgba(0, 0, 0, 0.75);
  font-size: 18px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    text-align: left;
    padding: 0 1rem 0;
    margin: 3px 0;
  `};
`

const JewelBalanceStyled = styled.div`
  display: flex;
  color: white;
  margin: 0 0 4px;
  padding: 0;
  font-size: 14px;
  text-shadow: 1px rgba(0, 0, 0, 0.75);

  div {
    font-size: 14px;
    margin-right: 2px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 1rem 0;
    font-size: 12px;

    div {
      font-size: 12px;
      margin-right: 2px;
    }
  `};
`

const JewelBalanceInlineStyled = styled.div`
  color: white;
  margin: 0.5em 0;
  padding: 0;
  text-shadow: 1px rgba(0, 0, 0, 0.75);
  text-align: left;

  div {
    font-size: 14px;
    line-height: 1.5;
    display: block;
  }

  span {
    font-size: 18px;
    line-height: 1.5;
    display: block;
  }

  h4 {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    display: block;
    font-weight: 400;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const InventoryRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  margin: 0 0 4px;
  font-size: 14px;
  color: white;
  background-color: transparent;
  border: 0;
  padding: 0;
  line-height: 1.5;
  width: 100%;
  white-space: nowrap;

  &.airdrop-button {
    display: block;
    text-align: center;

    &:hover {
      color: ${themeColors.forestGreen};
    }
  }

  h4 {
    margin: 0;
    font-weight: 400;
    letter-spacing: 0.03em;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 2px 16px 0;
    line-height: 1;

    &.airdrop-button {
      padding-bottom: 5px;
    }

    h4 {
      font-size: 12px;
    }

    img {
      margin-right: 5px;
    }
  `};
`

const InventoryImage = styled.img`
  width: 20px;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
`

const HideProfileButton = styled.button`
  background: ${themeColors.goldDim};
  position: relative;
  top: -1px;
  z-index: 1;
  width: 50px;
  border-radius: 0 0 3px 3px;
  margin: 1px auto 0;
  box-shadow: inset 0 6px 2px -5px rgba(0, 0, 0, 0.35);
  border: 1px solid ${themeColors.gold};
  border-top: 0;
  font-size: 10px;
  line-height: 1;
  padding: 3px 0;
  display: block;
  color: ${themeColors.gold};
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
      width: auto;
      padding: 0 5px;
      height: 50px;
      border-radius: 0 3px 3px 0;
      border-top:  1px solid ${themeColors.gold};
      border-left: 0;
      position: absolute;
      left: 94px;
      top: calc(50% - 25px);
      display: flex;
      align-items: center;
      font-size: 8px;
      box-shadow: inset 6px 0 2px -5px rgba(0, 0, 0, 0.35);

      > svg {
        transform: rotate(-90deg);
      }
  `};
`

const LoadWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`
