import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import discord from '../../assets/svg/discord.svg'
import github from '../../assets/svg/github.svg'
import Logo from '../../assets/svg/mobius.svg'
import twitter from '../../assets/svg/twitter.svg'
import { colors, TYPE } from '../../theme'

const { primary1: mobiGreen, bg4 } = colors(false)

const Container = styled.div`
  width: 50vw;
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100vw;
    height: 100vh;
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
  width: min(30rem, 95%);
`

export const StyledMenuButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 47%);
  height: 100%;
  border: none;
  background-color: ${mobiGreen};
  margin: 2rem;
  margin-top: 0.5rem;
  padding: 1rem;
  height: 35px;
  margin-left: 8px;
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

export const ComingSoon = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: min(15rem, 47%);
  height: 100%;
  border: none;
  background-color: ${bg4};
  margin: 2rem;
  margin-top: 0;
  padding: 1.5rem;
  height: 35px;
  margin-left: 8px;
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
  return (
    <Container>
      <TYPE.largeHeader fontWeight={1000} fontSize={[36, 48]}>
        Mobius
      </TYPE.largeHeader>
      <TYPE.subHeader style={{ textAlign: 'center' }}>
        A mobile-first DeFi exchange <br /> bridging Celo, Ethereum & more.
      </TYPE.subHeader>
      <LogoContainer>
        <img width="100%" src={Logo} alt="logo" />
      </LogoContainer>
      <StyledMenuButton id={`home-nav-link`} to={'/swap'}>
        Open Mobius
      </StyledMenuButton>
      <ComingSoon>
        Bridge Assets <br /> (Coming Soon)
      </ComingSoon>

      <Footer>
        <ExternalLink href="https://github.com/mobiusAMM" target="_blank">
          <img src={github} width="100%" />
        </ExternalLink>
        <ExternalLink href="https://discord.gg/YwzFuc2a" target="_blank" style={{ background: 'none' }}>
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
