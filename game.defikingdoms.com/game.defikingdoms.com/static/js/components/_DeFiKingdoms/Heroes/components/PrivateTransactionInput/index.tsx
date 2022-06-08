import { useState } from 'react'
import { TextField } from '@material-ui/core'
import { getProfile } from 'features/profile/api'
import { Profile } from 'features/profile/types'
import { useActiveWeb3React } from 'hooks'
import { red } from 'utils/colors'
import ProfilePic from '../ProfilePic'

interface PrivateTransactionProps {
  setAddress: Function
  setProfile: Function
  address: string
  profile: Profile | null
}

const PrivateTransaction = ({ address, profile, setAddress, setProfile }: PrivateTransactionProps) => {
  const { chainId } = useActiveWeb3React()
  const [noProfileError, setNoProfileError] = useState<string | null>(null)

  const getProfileLocal = async (id: any) => {
    if (!chainId) return
    try {
      const newProfile = await getProfile({ id, chainId })
      if (newProfile && (newProfile?.name.trim() !== '' || newProfile?.picUri !== null)) {
        setProfile(newProfile)
        setNoProfileError(null)
      } else {
        setNoProfile()
      }
    } catch (error) {
      setNoProfile()
    }
  }

  const setNoProfile = () => {
    setProfile(null)
    setNoProfileError('No profile found for this address. Please verify the address and proceed with caution.')
  }

  const handleAddressChange = (e: any) => {
    const value = e.target && e.target.value
    setAddress(e.target.value)

    if (value && value.length === 42 && value !== address) {
      getProfileLocal(value)
    } else {
      if (value.length !== 42) setProfile(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 5 }}>Enter address</div>
      <TextField
        id={'hero-view-id'}
        variant="outlined"
        value={address}
        type="text"
        style={{ width: '100%', maxWidth: '100%', textAlign: 'left' }}
        onChange={handleAddressChange}
      />
      {profile && <ProfilePic profile={profile} />}
      {noProfileError && <p style={{ fontSize: 14, color: red }}>{noProfileError}</p>}
    </div>
  )
}

export default PrivateTransaction
