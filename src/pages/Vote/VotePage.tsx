import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { TokenAmount } from '@ubeswap/sdk'
import { useActiveContractKit } from 'hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import JSBI from 'jsbi'
import { DateTime } from 'luxon/src/luxon'
import React, { useState } from 'react'
import { ArrowLeft } from 'react-feather'
import ReactMarkdown from 'react-markdown'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components/macro'

import { ButtonPrimary } from '../../components/Button'
import { GreyCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import { CardSection, DataCard } from '../../components/earn/styled'
import { RowBetween, RowFixed } from '../../components/Row'
import VoteModal from '../../components/vote/VoteModal'
import {
  AVERAGE_BLOCK_TIME_IN_SECS,
  DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
  GOVERNANCE_ADDRESS,
} from '../../constants/governance'
import { ApplicationModal } from '../../state/application/actions'
import { useBlockNumber, useModalOpen, useToggleVoteModal } from '../../state/application/hooks'
import { ProposalData, ProposalState, useProposalData, useUserVotesAsOfBlock } from '../../state/governance/hooks'
import { VoteOption } from '../../state/governance/types'
import { ExternalLink, StyledInternalLink, TYPE } from '../../theme'
import { isAddress } from '../../utils'
import { ProposalStatus } from './styled'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const ProposalInfo = styled(AutoColumn)`
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  max-width: 640px;
  width: 100%;
`

const ArrowWrapper = styled(StyledInternalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  color: ${({ theme }) => theme.text1};

  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
  :hover {
    text-decoration: none;
  }
`
const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: fit-content;
  z-index: 2;
`

const ProgressWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`

const Progress = styled.div<{ status: 'for' | 'against'; percentageString?: string }>`
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme, status }) => (status === 'for' ? theme.green1 : theme.red1)};
  width: ${({ percentageString }) => percentageString};
`

const MarkDownWrapper = styled.div`
  max-width: 640px;
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
  `};
`

const DetailText = styled.div`
  word-break: break-all;
`

const ProposerAddressLink = styled(ExternalLink)`
  word-break: break-all;
`

export default function VotePage({
  match: {
    params: { id },
  },
}: RouteComponentProps<{ governorIndex: string; id: string }>) {
  const { chainId, account } = useActiveContractKit()

  // get data for this specific proposal
  const proposalData: ProposalData | undefined = useProposalData(id)

  // update vote option based on button interactions
  const [voteOption, setVoteOption] = useState<VoteOption | undefined>(undefined)

  // modal for casting votes
  const showVoteModal = useModalOpen(ApplicationModal.VOTE)
  const toggleVoteModal = useToggleVoteModal()
  console.log(proposalData)

  // get and format date from data
  const currentTimestamp = useCurrentBlockTimestamp()
  const currentBlock = useBlockNumber()
  const endDate: DateTime | undefined =
    proposalData && currentTimestamp && currentBlock
      ? DateTime.fromSeconds(
          currentTimestamp
            .add(
              BigNumber.from(
                (chainId && AVERAGE_BLOCK_TIME_IN_SECS[chainId]) ?? DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS
              ).mul(BigNumber.from(proposalData.endBlock - currentBlock))
            )
            .toNumber()
        )
      : undefined
  const now: DateTime = DateTime.local()

  // get total votes and format percentages for UI
  const totalVotes: number | undefined = proposalData ? proposalData.forCount + proposalData.againstCount : undefined
  const forPercentage = `${
    proposalData && totalVotes ? ((proposalData.forCount * 100) / totalVotes).toFixed(0) : '0'
  } %`
  const againstPercentage = `${
    proposalData && totalVotes ? ((proposalData.againstCount * 100) / totalVotes).toFixed(0) : '0'
  } %`

  // only count available votes as of the proposal start block
  const availableVotes: TokenAmount | undefined = useUserVotesAsOfBlock(proposalData?.startBlock ?? undefined)

  // only show voting if user has > 0 votes at proposal start block and proposal is active,
  const showVotingButtons =
    availableVotes &&
    JSBI.greaterThan(availableVotes.quotient, JSBI.BigInt(0)) &&
    proposalData &&
    proposalData.status === ProposalState.ACTIVE

  console.log(availableVotes?.toFixed(3), proposalData?.status, ProposalState.ACTIVE)

  // const uniBalance: TokenAmount | undefined = useTokenBalance(
  //   account ?? undefined,
  //   chainId ? VEMOBI[chainId] : undefined
  // )

  // in blurb link to home page if they are able to unlock
  // const showLinkForUnlock = Boolean(
  //   uniBalance && JSBI.notEqual(uniBalance.quotient, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  // )

  // show links in propsoal details if content is an address
  // if content is contract with common name, replace address with common name
  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      const commonName = content === GOVERNANCE_ADDRESS ? 'Mobius Governance' : content
      return <ExternalLink href={`https://explorer.celo.org/address/${content}`}>{commonName}</ExternalLink>
    }
    return <span>{content}</span>
  }

  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <VoteModal
          isOpen={showVoteModal}
          onDismiss={toggleVoteModal}
          proposalId={proposalData?.id}
          voteOption={voteOption}
        />
        <ProposalInfo gap="lg" justify="start">
          <RowBetween style={{ width: '100%' }}>
            <ArrowWrapper to="/vote">
              <TYPE.main>
                <ArrowLeft size={20} /> All Proposals
              </TYPE.main>
            </ArrowWrapper>
            {proposalData && <ProposalStatus status={proposalData.status} />}
          </RowBetween>
          <AutoColumn gap="10px" style={{ width: '100%' }}>
            <TYPE.largeHeader style={{ marginBottom: '.5rem' }}>{proposalData?.title}</TYPE.largeHeader>
            <RowBetween>
              <TYPE.main>
                {endDate && endDate < now ? (
                  <TYPE.main>Voting ended {endDate && endDate.toLocaleString(DateTime.DATETIME_FULL)}</TYPE.main>
                ) : proposalData ? (
                  <TYPE.main>
                    Voting ends approximately {endDate && endDate.toLocaleString(DateTime.DATETIME_FULL)}
                  </TYPE.main>
                ) : (
                  ''
                )}
              </TYPE.main>
            </RowBetween>
            {proposalData && proposalData.status === ProposalState.ACTIVE && !showVotingButtons && (
              <GreyCard>
                <TYPE.black>
                  <TYPE.main>
                    Only VEMOBI votes that were self delegated or delegated to another address before block{' '}
                    {proposalData.startBlock} are eligible for voting.{' '}
                  </TYPE.main>
                  {/* {showLinkForUnlock && (
                    <span>
                      <TYPE.main>
                        <StyledInternalLink to="/vote">Unlock voting</StyledInternalLink> to prepare for the next
                        proposal.
                      </TYPE.main>
                    </span>
                  )} */}
                </TYPE.black>
              </GreyCard>
            )}
          </AutoColumn>
          {showVotingButtons ? (
            <RowFixed style={{ width: '100%', gap: '12px' }}>
              <ButtonPrimary
                padding="8px"
                $borderRadius="8px"
                onClick={() => {
                  setVoteOption(VoteOption.For)
                  toggleVoteModal()
                }}
              >
                <TYPE.main>Vote For</TYPE.main>
              </ButtonPrimary>
              <ButtonPrimary
                padding="8px"
                $borderRadius="8px"
                onClick={() => {
                  setVoteOption(VoteOption.Against)
                  toggleVoteModal()
                }}
              >
                <TYPE.main>Vote Against</TYPE.main>
              </ButtonPrimary>
            </RowFixed>
          ) : (
            ''
          )}
          <CardWrapper>
            <StyledDataCard>
              <CardSection>
                <AutoColumn gap="md">
                  <WrapSmall>
                    <TYPE.black fontWeight={600}>
                      <TYPE.main>For</TYPE.main>
                    </TYPE.black>
                    <TYPE.black fontWeight={600}>
                      {proposalData?.forCount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TYPE.black>
                  </WrapSmall>
                </AutoColumn>
                <ProgressWrapper>
                  <Progress status={'for'} percentageString={forPercentage} />
                </ProgressWrapper>
              </CardSection>
            </StyledDataCard>
            <StyledDataCard>
              <CardSection>
                <AutoColumn gap="md">
                  <WrapSmall>
                    <TYPE.black fontWeight={600}>
                      <TYPE.main>Against</TYPE.main>
                    </TYPE.black>
                    <TYPE.black fontWeight={600}>
                      {proposalData?.againstCount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TYPE.black>
                  </WrapSmall>
                </AutoColumn>
                <ProgressWrapper>
                  <Progress status={'against'} percentageString={againstPercentage} />
                </ProgressWrapper>
              </CardSection>
            </StyledDataCard>
          </CardWrapper>
          <AutoColumn gap="md">
            <TYPE.mediumHeader fontWeight={600}>
              <TYPE.main>Details</TYPE.main>
            </TYPE.mediumHeader>
            {proposalData?.details?.map((d, i) => {
              return (
                <DetailText key={i}>
                  {i + 1}: {linkIfAddress(d.target)}.{d.functionSig}(
                  {d.callData.split(',').map((content, i) => {
                    return (
                      <span key={i}>
                        {linkIfAddress(content)}
                        {d.callData.split(',').length - 1 === i ? '' : ','}
                      </span>
                    )
                  })}
                  )
                </DetailText>
              )
            })}
          </AutoColumn>
          <AutoColumn gap="md">
            <TYPE.mediumHeader fontWeight={600}>
              <TYPE.main>Description</TYPE.main>
            </TYPE.mediumHeader>
            <MarkDownWrapper>
              <ReactMarkdown source={proposalData?.description} />
            </MarkDownWrapper>
          </AutoColumn>
          <AutoColumn gap="md">
            <TYPE.mediumHeader fontWeight={600}>
              <TYPE.main>Proposer</TYPE.main>
            </TYPE.mediumHeader>
            <ProposerAddressLink
              href={
                proposalData?.proposer && chainId ? `https://explorer.celo.org/address/${proposalData?.proposer}` : ''
              }
            >
              <ReactMarkdown source={proposalData?.proposer} />
            </ProposerAddressLink>
          </AutoColumn>
        </ProposalInfo>
      </PageWrapper>
    </>
  )
}
