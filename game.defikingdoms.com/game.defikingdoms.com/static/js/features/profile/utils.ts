import errorHandler from 'utils/errorHandler'
import { Profile, ProfileData, ProfileRaw } from './types'

export const convertIPFSToken = async (token: string) => {
  const tokenDataUri = token.replace('ipfs://', '')
  try {
    const response = await fetch(`https://gateway.ipfs.io/ipfs/${tokenDataUri}`, {
      method: 'GET'
    })
    const formattedData = await response.json()
    const imageUri = formattedData.image.replace('ipfs://', '')
    return `https://gateway.ipfs.io/ipfs/${imageUri}`
  } catch (error) {
    errorHandler(error)
    return ''
  }
}

export const convertRawProfile = async (profileRaw: ProfileRaw) => {
  let picUri = profileRaw.picUri

  const formattedProfile = {
    name: profileRaw.name,
    nftId: Number(profileRaw.nftId),
    collectionId: Number(profileRaw.collectionId),
    owner: profileRaw.owner,
    created: Number(profileRaw.created),
    picUri
  }

  if (formattedProfile.collectionId > 1 && picUri) {
    picUri = await convertIPFSToken(picUri)
  }

  formattedProfile.picUri = picUri
  return formattedProfile
}

export const buildApiProfile = async (profileData: ProfileData): Promise<Profile> => {
  let picUri = profileData.picuri

  const profile = {
    name: profileData.name,
    nftId: profileData.nftid,
    collectionId: Number(profileData.collectionid),
    owner: profileData.owner,
    created: Number(profileData.created),
    picUri
  }

  if (profile.collectionId > 1 && picUri) {
    picUri = await convertIPFSToken(picUri)
  }

  profile.picUri = picUri
  return profile
}
