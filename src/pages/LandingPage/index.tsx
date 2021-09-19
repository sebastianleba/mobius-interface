import React from 'react'
import Countdown from 'react-countdown'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import Logo from '../../assets/images/mobius-ring.png'
import discord from '../../assets/svg/discord.svg'
import github from '../../assets/svg/github.svg'
import twitter from '../../assets/svg/twitter.svg'
import { colors, TYPE } from '../../theme'

const { primary1: mobiGreen, bg4 } = colors(false)

const StyledCountdown = styled(Countdown)`
  padding: 2rem;
  font-size: 3rem;
`

const Container = styled.div`
  padding-top: 4rem;
  width: 50vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 90vw;
    padding: 1.25rem;
    padding-top: 0;
    margin-top: 0;
    height: 80vh;
`}
  overflow: none;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ExternalLink = styled.a`
  margin: 0.5rem;
  height: 3rem;
  width: 3rem;
  border-radius: 2rem;
  background: white;
  cursor: pointer;
`

const LogoContainer = styled.div`
  width: min(25rem, 95%);
  margin-top: 2rem;
`

export const StyledMenuButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 70%);
  height: 100%;
  border: none;
  background-color: ${mobiGreen};
  margin: 2rem;
  margin-top: 0.5rem;
  padding: 1rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.primary2};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const ComingSoon = styled.a`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 70%);
  height: 100%;
  border: none;
  background-color: ${bg4};
  margin: 2rem;
  margin-top: 0;
  padding: 1.5rem;
  height: 35px;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 1000;
  color: black;
  text-decoration: none;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
//   [ChainId.ALFAJORES]: 'Alfajores',
//   [ChainId.BAKLAVA]: 'Baklava',
// }

export default function LandingPage() {
  const launchTime = new Date(Date.UTC(2021, 8, 3, 20))
  const now = new Date()
  const isLive = true

  return (
    <Container>
      <TYPE.largeHeader fontWeight={1000} fontSize={[36, 48]}>
        Mobius
      </TYPE.largeHeader>
      <TYPE.mediumHeader style={{ textAlign: 'center' }} fontWeight={300}>
        A cross-chain stableswap DeFi exchange on Celo
      </TYPE.mediumHeader>
      <LogoContainer>
        <img width="100%" src={Logo} alt="logo" />
      </LogoContainer>
      {isLive ? (
        <>
          <StyledMenuButton id={`home-nav-link`} to={'/swap'}>
            Open Mobius
          </StyledMenuButton>
          <StyledMenuButton id={`home-nav-link`} to={'/optics'}>
            Bridge Assets
          </StyledMenuButton>
        </>
      ) : (
        <StyledCountdown date={launchTime} />
      )}

      <Footer>
        <ExternalLink href="https://github.com/mobiusAMM" target="_blank">
          <img src={github} width="100%" />
        </ExternalLink>
        <ExternalLink href="https://discord.gg/e4qYT6cZeM" target="_blank" style={{ background: 'none' }}>
          <img src={discord} width="100%" />
        </ExternalLink>
        <ExternalLink href="https://twitter.com/MobiusMoney" target="_blank">
          <img src={twitter} width="100%" />
        </ExternalLink>
      </Footer>
    </Container>
  )
}

// ;<HeaderLinks>
//   <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
//     {t('swap')}
//   </StyledNavLink>
//   <StyledNavLink
//     id={`pool-nav-link`}
//     to={'/pool'}
//     isActive={(match, { pathname }) =>
//       Boolean(match) ||
//       pathname.startsWith('/add') ||
//       pathname.startsWith('/remove') ||
//       pathname.startsWith('/create') ||
//       pathname.startsWith('/find')
//     }
//   >
//     Pool
//   </StyledNavLink>
// </HeaderLinks>

// const UBEAmount = styled(AccountElement)`
//   color: white;
//   padding: 4px 8px;
//   height: 36px;
//   font-weight: 500;
//   background-color: ${({ theme }) => theme.bg3};
//   background: radial-gradient(174.47% 188.91% at 1.84% 0%, ${({ theme }) => theme.primary1} 0%, #2172e5 100%), #edeef2;
// `

// const UBEWrapper = styled.span`
//   width: fit-content;
//   position: relative;
//   cursor: pointer;
//   :hover {
//     opacity: 0.8;
//   }
//   :active {
//     opacity: 0.9;
//   }
// `
