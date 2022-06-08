import { dispatch } from 'features'
import { getHeroes } from 'features/heroes/api'
import { getAccount } from 'features/web3/utils'
import { getProfilesCore } from 'utils/contracts'
import errorHandler from 'utils/errorHandler'
import { setBoredApeTokens, setProfileHeroes } from './state'
import { ProfileCollection, ProfilePicture } from './types'
import { convertIPFSToken } from './utils'

export const fetchProfileHeroes = async (account: string | null | undefined) => {
  if (account) {
    const { data } = await getHeroes({
      params: { limit: 9999, owner: account }
    })
    dispatch(setProfileHeroes(data))
  }
}

export const fetchBoredApes = async () => {
  const account = getAccount()
  const profileCore = getProfilesCore()
  const boredApes: ProfilePicture[] = []

  try {
    const tokens = await profileCore.getTokenUrisHeldByAddress(account, ProfileCollection.BORED_APE)
    for (const token of tokens) {
      const nftId = token.split('/').pop()
      const imageUri = await convertIPFSToken(token)
      if (nftId) {
        boredApes.push({
          id: Number(nftId),
          collectionId: 2,
          src: imageUri
        })
      }
    }

    dispatch(setBoredApeTokens(boredApes))
  } catch (error) {
    errorHandler(error)
  }
}
