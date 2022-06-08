import { getClickCursor, getDefaultCursor } from 'features/preferences/utils'
import styled, { keyframes } from 'styled-components/macro'

export const fadeIn = keyframes`
    from {
       opacity: 0;
    }
    50% {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`

export const AppWrapper = styled.div<{ customCursor?: boolean }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  height: 100vh;
  animation: ${fadeIn} 4s;
  cursor: ${({ customCursor }) => (customCursor ? `url(${getDefaultCursor()}), auto !important` : 'auto')};

  a,
  button {
    cursor: ${({ customCursor }) => (customCursor ? `url(${getClickCursor()}), pointer !important` : 'pointer')};
  }
`

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
`

export const AudioPosition = styled.div`
  position: absolute;
  bottom: 64px;
  right: 2rem;
  z-index: 21;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: .5rem;
  `};
`

export const PollingPosition = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 21;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    bottom: .5rem;
    right: .5rem;
  `};
`

export const PopupsPosition = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    bottom: .5rem;
    right: .5rem;
  `};
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const ProfilePosition = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 20;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 1rem;
    left: 1rem;
  `};
`

export const NavPosition = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 22;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: .5rem;
    right: .5rem;
  `};
`

export const StatusPosition = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
`

export const LanguagePosition = styled.div`
  position: absolute;
  bottom: 64px;
  right: 122px;
  z-index: 21;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 118px;
  `};
`
