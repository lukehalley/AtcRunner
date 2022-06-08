import { useEffect, useState } from 'react'
import { getHeroById } from 'features/heroes/api'
import { Profile, ProfileCollection } from 'features/profile/types'
import styled from 'styled-components/macro'
import HeroProfile from '../HeroProfile'

interface ProfilePicProps {
  profile: Profile
  dark?: boolean
}

export default function ProfilePic({ dark, profile }: ProfilePicProps) {
  const [profileHero, setProfileHero] = useState<any>(null)

  useEffect(() => {
    getHeroData()
  }, [profile])

  const getHeroData = async () => {
    if (profile.collectionId === ProfileCollection.HERO) {
      try {
        const heroArray = await getHeroById(profile.nftId.toString())
        if (heroArray.length > 0) {
          const hero = heroArray[0]
          setProfileHero(hero)
        }
      } catch (error) {
        console.log('error getting hero pic')
      }
    }
  }

  return (
    <ProfileBoxStyled>
      <ProfileBoxImageStyled
        className={profile.collectionId === ProfileCollection.HERO ? '' : 'bordered-box bordered-box-hero'}
        style={{ marginRight: '10px', padding: 0, borderImageWidth: '6px', borderImageOutset: '0px' }}
      >
        <ProfileBoxImageBgStyled>
          {profile.collectionId === ProfileCollection.HERO ? (
            <>{profileHero && <HeroProfile hero={profileHero} profileSmall />}</>
          ) : (
            <img src={profile.picUri} />
          )}
        </ProfileBoxImageBgStyled>
      </ProfileBoxImageStyled>
      <ProfileTextStyled>
        <p
          style={{ margin: 0, opacity: dark ? 1 : 0.5, color: dark ? '#000' : '#fff', fontWeight: dark ? 'bold' : 400 }}
        >
          Owned By: {profile.name}
        </p>
      </ProfileTextStyled>
    </ProfileBoxStyled>
  )
}

const ProfileBoxStyled = styled.div`
  width: auto;
  margin: 12px 0 16px;
  text-align: left;
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    max-width: 270px;
    display: flex;
    flex-flow: row nowrap;
  `};
`

const ProfileBoxImageStyled = styled.div`
  width: 60px;
  min-height: 50px;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  margin-right: auto;
  position: relative;
  z-index: 1;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 68px;
    max-width: 68px;
    margin-left: 0;
    margin-right: 0;

    img {
      width: 61px;
    }

  `};
`

const ProfileBoxImageBgStyled = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 61px;
    max-width: 61px;
  `};
`

const ProfileTextStyled = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  text-align: left;
  font: normal normal normal 12px/18px Poppins;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 0px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    max-width: 270px;
    display: flex;
    flex-flow: row nowrap;
  `};
`
