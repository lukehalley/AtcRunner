import { ChainId } from 'constants/sdk-extra'
import { BigNumber } from 'ethers'

export type ProfileRaw = {
  owner: string
  name: string
  created: BigNumber
  nftId: BigNumber
  collectionId: BigNumber
  picUri: string
}

export type Profile = {
  owner: string
  name: string
  created: number
  nftId: number
  collectionId: number
  picUri: string
}

export type ProfilePicture = {
  id: number
  collectionId: number
  src: string
}

export enum ProfileCollection {
  STANDARD = 0,
  HERO = 1,
  BORED_APE
}

type ChainIdKey = { [key in ChainId]: string }

export type Request = {
  profile: ChainIdKey
}

export type GetProfilePayload = {
  id: string
  chainId: ChainId
}

export type ProfileData = {
  id: string
  collectionid: string
  created: Date | null
  heroid: string | null
  name: string
  nftid: number
  owner: string
  picuri: string
  profileid: string | null
  lockedBalancePending: boolean
}
