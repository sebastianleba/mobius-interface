import { TokenAmount } from '@ubeswap/sdk'
// import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from 'components/earn/styled'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
// import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import ProposalEmptyState from 'components/vote/ProposalEmptyState'
import { useActiveContractKit } from 'hooks'
import { darken } from 'polished'
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'rebass/styled-components'
import { ProposalData, useAllProposalData, useUserVotes } from 'state/governance/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'

import { UBE } from '../../constants/tokens'
import { ProposalStatus } from './styled'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const Proposal = styled(Button)`
  padding: 0.75rem 1rem;
  width: 100%;
  margin-top: 1rem;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  align-items: center;
  text-align: left;
  outline: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  background-color: ${({ theme }) => theme.bg1};
  &:focus {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.bg1)};
  }
`

const ProposalNumber = styled.span`
  opacity: 0.6;
`

const ProposalTitle = styled.span`
  font-weight: 600;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
  `};
`

const TextButton = styled(TYPE.main)`
  color: ${({ theme }) => theme.primary1};
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const AddressButton = styled.div`
  border: 1px solid ${({ theme }) => theme.bg3};
  padding: 2px 4px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.text1};
`

export default function Vote() {
  const { account, chainId } = useActiveContractKit()

  // get data to list all proposals
  const { data: allProposals, loading: loadingProposals } = useAllProposalData()

  // user data
  const { loading: loadingAvailableVotes, votes: availableVotes } = useUserVotes()
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, chainId ? UBE[chainId] : undefined)

  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <TopSection gap="md">
          <VoteCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>
                    <TYPE.main>Mobius Governance</TYPE.main>
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    <TYPE.main>
                      UNI tokens represent voting shares in Uniswap governance. You can vote on each proposal yourself
                      or delegate your votes to a third party.
                    </TYPE.main>
                  </TYPE.white>
                </RowBetween>
                <ExternalLink
                  style={{ color: 'white', textDecoration: 'underline' }}
                  href="https://uniswap.org/blog/uni"
                  target="_blank"
                >
                  <TYPE.white fontSize={14}>
                    <TYPE.main>Read more about Mobius governance</TYPE.main>
                  </TYPE.white>
                </ExternalLink>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </VoteCard>
        </TopSection>
        <TopSection gap="2px">
          <WrapSmall>
            <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>
              <TYPE.main>Proposals</TYPE.main>
            </TYPE.mediumHeader>
            <AutoRow gap="6px" justify="flex-end">
              {loadingProposals || loadingAvailableVotes ? <Loader /> : null}
              <TYPE.body fontWeight={500} mr="6px">
                <TYPE.main>
                  <FormattedCurrencyAmount currencyAmount={uniBalance} /> Votes
                </TYPE.main>
              </TYPE.body>

              {/* <ButtonPrimary
                as={Link}
                to="/create-proposal"
                style={{ width: 'fit-content', borderRadius: '8px' }}
                padding="8px"
              >
                <TYPE.main>Create Proposal</TYPE.main>
              </ButtonPrimary> */}
            </AutoRow>
          </WrapSmall>
          {allProposals?.length === 0 && <ProposalEmptyState />}
          {allProposals
            ?.slice(0)
            ?.reverse()
            ?.map((p: ProposalData) => {
              return (
                <Proposal as={Link} to={`/vote//${p.id}`} key={`${p.id}`}>
                  <ProposalNumber>{p.id}</ProposalNumber>
                  <ProposalTitle>{p.title}</ProposalTitle>
                  <ProposalStatus status={p.status} />
                </Proposal>
              )
            })}
        </TopSection>
        <TYPE.subHeader color="text3">
          <TYPE.main>A minimum threshold of 0.25% of the total UNI supply is required to submit proposals</TYPE.main>
        </TYPE.subHeader>
      </PageWrapper>
      {/* <SwitchLocaleLink /> */}
    </>
  )
}
