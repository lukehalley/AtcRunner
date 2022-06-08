import { CSSProperties, useEffect } from 'react'
import { useSelector } from 'features/hooks'
import { ProfilePicture } from 'features/profile/types'
import styled from 'styled-components/macro'
import titleLeft from 'assets/images/gui/gui_title_left.png'
import titleMiddle from 'assets/images/gui/gui_title_middle.png'
import titleRight from 'assets/images/gui/gui_title_right.png'
import ProfileChoice from '../ProfileChoice'

interface ProfileSelectionProps {
  includeHeroes?: boolean
  pickerStyle?: CSSProperties
  selectedPicData: ProfilePicture
  setSelectedPicData: Function
}

const ProfileSelection = ({
  includeHeroes,
  pickerStyle,
  selectedPicData,
  setSelectedPicData
}: ProfileSelectionProps) => {
  const { boredApeTokens, profileHeroes } = useSelector(s => s.profile)

  useEffect(() => {
    if (boredApeTokens.length > 0) {
      setSelectedPicData(boredApeTokens[0])
    }
  }, [])

  const pictureSelect = (picData: ProfilePicture) => {
    setSelectedPicData(picData)
  }

  const profilePics = [...Array(25).keys()].map(k => ({
    id: k,
    collectionId: 0,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src: require('assets/images/profile-pics/p' + k + '.png').default
  }))

  return (
    <>
      <ProfileTitle includeHeroes={includeHeroes}>
        <ProfileTitleStyled>Select Profile Image</ProfileTitleStyled>
      </ProfileTitle>
      <ProfilePicker style={pickerStyle} includeHeroes={includeHeroes}>
        {boredApeTokens.map(pfp => (
          <ProfileChoice
            key={pfp.id}
            selected={selectedPicData.id == pfp.id}
            onClick={pictureSelect}
            picData={{ ...pfp }}
          />
        ))}
        {profilePics.map(pfp => (
          <ProfileChoice
            key={pfp.id}
            selected={selectedPicData.id == pfp.id}
            onClick={pictureSelect}
            picData={{ ...pfp }}
          />
        ))}
        {includeHeroes &&
          profileHeroes.length > 0 &&
          profileHeroes.map((hero: any) => (
            <ProfileChoice
              key={hero.id}
              selected={selectedPicData.id == hero.id}
              onClick={pictureSelect}
              picData={{ id: hero.id, collectionId: 1, src: '' }}
              hero={hero}
            />
          ))}
      </ProfilePicker>
    </>
  )
}

export default ProfileSelection

const ProfileTitle = styled.div<{ includeHeroes?: boolean }>`
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

  @media (max-width: 470px) {
    margin-top: ${({ includeHeroes }) => (includeHeroes ? '10px' : '-64px')};
  }
`

const ProfileTitleStyled = styled.span`
  background: url(${titleMiddle});
  background-repeat: repeat-x;
  line-height: 70px;
  height: 70px;
  display: inline-block;
  position: relative;
  padding: 0 20px;

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

const ProfilePicker = styled.div<{ includeHeroes?: boolean }>`
  z-index: 1000;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  height: calc(100% - 20px);
  flex-direction: row;
  align-content: flex-start;
  justify-content: center;

  @media (max-width: 470px) {
    height: ${({ includeHeroes }) => (includeHeroes ? 'calc(100% - 94px)' : 'calc(100% - 20px)')};
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: #daad82;
    border-radius: 20px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #744e45;
    border-radius: 20px;
  }
`
