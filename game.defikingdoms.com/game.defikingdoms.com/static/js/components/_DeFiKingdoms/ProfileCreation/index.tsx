import { useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Button } from 'components/Buttons'
import FancyModal from 'components/_DeFiKingdoms/FancyModal'
import { Input as ProfileNameInput } from 'components/_DeFiKingdoms/ProfileCreation/components/ProfileNameInput'
import { ProfileCollection, ProfilePicture } from 'features/profile/types'
import { useTransactionAdder } from 'features/transactions/hooks'
import useWalletBalance from 'hooks/useWalletBalance'
import styled from 'styled-components/macro'
import { getProfilesCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import titleLeft from 'assets/images/gui/gui_title_left.png'
import titleMiddle from 'assets/images/gui/gui_title_middle.png'
import titleRight from 'assets/images/gui/gui_title_right.png'
import borderActive from 'assets/images/profile-pics/pBorder.png'
import FancyContainer from '../FancyContainer'
import ProfileSelection from './components/ProfileSelection'
import styles from './index.module.scss'

interface ProfileCreationProps {
  closeModal: Function
  showModal: boolean
}

export default function ProfileCreation({ closeModal, showModal }: ProfileCreationProps) {
  const addTransaction = useTransactionAdder()
  const [name, setName] = useState<string>('')
  const [selectedPicData, setSelectedPicData] = useState<ProfilePicture>({
    id: 0,
    collectionId: 0,
    src: 'https://defi-kingdoms.b-cdn.net/art-assets/profile-pics/p0.png'
  })

  const [isFetching, setIsFetching] = useState<boolean>(false)
  const balance = useWalletBalance()

  function validateName(name: string) {
    const badGuyRegex = new RegExp(/[^\x00-\x7F]/g)
    const isSafeName = !badGuyRegex.test(name)
    if (isSafeName) {
      return true
    }
    alert('Your profile name contains unusable symbols.')
    return false
  }

  async function onCreate() {
    const profileCore = getProfilesCore()

    if (!validateName(name)) return
    if (profileCore) {
      setIsFetching(true)
      try {
        const response: TransactionResponse = await profileCore.createProfile(
          name,
          selectedPicData.id,
          selectedPicData.collectionId
        )

        addTransaction(response, {
          summary: 'Created Profile'
        })

        await response.wait(1).then(receipt => {
          setIsFetching(false)
          location.reload()
        })
      } catch (error) {
        setIsFetching(false)
        errorHandler(error)
      }
    }
  }

  return (
    <FancyModal
      closeModal={closeModal}
      showModal={showModal}
      className={styles.profileCreation}
      wrapperClassName={styles.profileCreationWrapper}
      contentClassName={styles.profileCreationRight}
      prependComponent={
        <FancyContainer className={styles.profileCreationLeft}>
          <ProfileSelection selectedPicData={selectedPicData} setSelectedPicData={setSelectedPicData} />
        </FancyContainer>
      }
      disableTrap
    >
      <ProfileTitle>
        <ProfileTitleStyled>Profile Details</ProfileTitleStyled>
      </ProfileTitle>
      {balance !== null && balance > 0 ? (
        <>
          <ProfilePicChosen boredApe={selectedPicData.collectionId === ProfileCollection.BORED_APE}>
            <ProfilePicFrame />
            <img src={selectedPicData.src} />
          </ProfilePicChosen>
          <ProfileNameInput
            className="profile-name-input"
            value={name}
            onUserInput={val => {
              setName(val)
            }}
          />

          <Button
            type="new"
            containerStyle={{ maxWidth: '340px' }}
            style={{ padding: '10px 1rem' }}
            loading={isFetching}
            loadingSize="16px"
            onClick={onCreate}
            disabled={name.trim() === ''}
            fullWidth
          >
            Complete Profile
          </Button>
        </>
      ) : (
        <div style={{ paddingTop: 60 }}>
          <div style={{ color: '#744e45', fontSize: '13px' }}>
            Looks like you don’t have any ONE yet. Follow the link below to the tutorial and refresh this page once you
            have some.
          </div>
          <Button
            type="new"
            containerStyle={{ maxWidth: '340px' }}
            style={{ padding: '10px 1rem' }}
            loadingSize="16px"
            fullWidth
            onClick={() => window.open('https://ramp.network/buy/', '_blank')}
          >
            Get Some ONE
          </Button>
        </div>
      )}
      <div>
        <Button type="ghostDark">
          <a href="https://defikingdoms.com/tutorial.html" target="__blank">
            <div style={{ color: '#744e45', fontSize: '13px' }}>Read the DFK Tutorial</div>
          </a>
        </Button>
      </div>
    </FancyModal>
  )
}

const ProfileTitle = styled.div`
  position: relative;
  text-align: center;
  font-family: 'Lora', serif;
  font-weight: bold;
  font-size: 30px;
  color: #491306;
  margin: -64px auto 20px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;
  `};
`

const ProfileTitleStyled = styled.span`
  background: url(${titleMiddle});
  background-repeat: repeat-x;
  line-height: 70px;
  height: 70px;
  display: inline-block;
  position: relative;
  padding: 0px 20px;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: -30px;
    width: calc(100% + 60px);
    height: 100%;
    background: url(${titleLeft}), url(${titleRight});
    background-repeat: no-repeat;
    background-position: top left, top right;
  }
`

const ProfilePicChosen = styled.div<{ boredApe: boolean }>`
  position: relative;
  display: inline-block;
  margin: 0 auto 20px;
  overflow: hidden;
  border-radius: 7px 0 7px 0;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${({ boredApe }) => (boredApe ? '90px' : '80px')};
    image-rendering: ${({ boredApe }) => (boredApe ? 'auto' : '-moz-crisp-edges')};
    image-rendering: ${({ boredApe }) => (boredApe ? 'auto' : 'pixelated')};
  }
`

const ProfilePicFrame = styled.div`
  position: relative;
  width: 96px;
  height: 100px;
  background: url(${borderActive});
  background-size: 100%;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  z-index: 1;
`
