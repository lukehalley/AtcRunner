import { generateStringEqualityParam } from 'utils/api'
import { HttpStatusCode } from 'utils/api/types'
import { REQUEST } from './constants'
import { GetProfilePayload, Profile, ProfileData } from './types'
import { buildApiProfile } from './utils'

export async function getProfile({ id, chainId }: GetProfilePayload): Promise<Profile | null> {
  const data = await getProfileData({ id, chainId })
  if (data) {
    return buildApiProfile(data)
  }
  return null
}

async function getProfileData({ id, chainId }: GetProfilePayload): Promise<ProfileData | null> {
  const params = id ? [generateStringEqualityParam('id', id)].filter(p => p) : []
  if (chainId) {
    const response = await fetch(REQUEST.profile[chainId], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        params
      })
    })

    if (response.status === HttpStatusCode.OK) {
      const data: ProfileData = await response.json()
      return data
    } else {
      console.warn(`Profile not found for account id: ${id}.`)
    }
  }
  return null
}
