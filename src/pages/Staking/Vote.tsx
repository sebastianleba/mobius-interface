import { CardNoise } from 'components/claim/styled'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { useColor } from 'hooks/useColor'
import React, { useState } from 'react'
import { GaugeSummary, useVotePowerLeft } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import GaugeVoteModal from './GaugeVoteModal'

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: ${({ theme }) => theme.text1} !important;
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
`

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  justify-content: space-between;
`

interface GaugeWeightsProps {
  summaries: GaugeSummary[]
}

export default function Vote({ summaries }: GaugeWeightsProps) {
  const [showUserVote, setShowUserVote] = useState(false)
  const votePowerLeft = useVotePowerLeft()

  return summaries.length === 0 ? (
    <Wrapper>
      <Loader />
    </Wrapper>
  ) : (
    <Wrapper>
      <TYPE.darkGray>Allocate your voting power to affect the MOBI distribution of each pool.</TYPE.darkGray>
      <TYPE.darkGray>{votePowerLeft}% Left to Allocate</TYPE.darkGray>
      <CardContainer>
        {summaries.map((summary) => (
          <WeightCard showUserVote={showUserVote} position={summary} key={`weight-card-${summary.pool}`} />
        ))}
      </CardContainer>
    </Wrapper>
  )
}

const PositionWrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any; activated: boolean }>`
  border-radius: 12px;
  width: 100%;
  height: fit-content;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  cursor: pointer;
  opacity: ${({ activated }) => (activated ? 1 : 0.9)};
  overflow: hidden;
  position: relative;
  background: ${({ bgColor, theme }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${theme.black} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
  &:hover {
    opacity: 1;
  }
  @media (min-width: 899px) {
    width: 49%;
  }
`
const RowWithGap = styled(RowFixed)`
  gap: 8px;
`

function WeightCard({ position, showUserVote }: { position: GaugeSummary; showUserVote: boolean }) {
  const backgroundColor = useColor(position.firstToken)
  const [voteModalOpen, setVoteModalOpen] = useState(false)

  return (
    <>
      <GaugeVoteModal summary={position} isOpen={voteModalOpen} onDismiss={() => setVoteModalOpen(false)} />

      <PositionWrapper
        activated={voteModalOpen}
        showBackground={true}
        bgColor={backgroundColor}
        onClick={() => setVoteModalOpen(true)}
      >
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color="white">{position.pool}</TYPE.mediumHeader>
          {showUserVote ? (
            <RowWithGap gap="4px">
              <TYPE.white color="white">Your Vote: </TYPE.white>
              <TYPE.white color="white">{`${position.powerAllocated.toFixed(2)}%`}</TYPE.white>
            </RowWithGap>
          ) : (
            <RowWithGap gap="4px">
              <TYPE.white color="white">{`Current: ${position.currentWeight.toFixed(2)}%`}</TYPE.white>
              <TYPE.white color="white">{`Future: ${position.futureWeight.toFixed(2)}%`}</TYPE.white>
            </RowWithGap>
          )}
        </RowBetween>
      </PositionWrapper>
    </>
  )
}
