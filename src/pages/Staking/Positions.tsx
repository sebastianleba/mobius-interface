import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { ButtonOutlined } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardNoise } from 'components/earn/styled'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { useColor } from 'hooks/useColor'
import React, { useState } from 'react'
import { usePriceOfLp } from 'state/stablePools/hooks'
import { GaugeSummary, MobiStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { calcBoost } from 'utils/calcExpectedVeMobi'

import ClaimAllMobiModal from './ClaimAllMobiModal'
import GaugeVoteModal from './GaugeVoteModal'

const Container = styled.div`
  width: 49%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 1rem;
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%
`}
`
const SmallButton = styled(ButtonOutlined)`
  padding: 0.5rem;
  width: 8rem;
  border-color: ${({ theme }) => theme.primary1};
`
const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any; activated: boolean }>`
  border-radius: 12px;
  width: 100%;
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
`
const Divider = styled.div<{ bg?: string }>`
  width: 100%;
  height: 1px;
  background: ${({ theme, bg }) => (bg ? bg : theme.primary1)};
  margin-top: 0.25rem;
  margin-bottom: 1.5rem;
`

type PositionsProps = {
  stakingInfo: MobiStakingInfo
  unclaimedMobi: TokenAmount
}
export default function Positions({ stakingInfo, unclaimedMobi }: PositionsProps) {
  const { positions = [] } = stakingInfo
  const loading = positions.length === 0
  const greaterThanZero = positions.filter(({ baseBalance }) => baseBalance.greaterThan('0'))
  const [openModal, setOpenModal] = useState(false)
  return (
    <Container>
      <ClaimAllMobiModal isOpen={openModal} onDismiss={() => setOpenModal(false)} summaries={greaterThanZero} />
      <RowBetween>
        <TYPE.largeHeader>Your Positions</TYPE.largeHeader>
        <SmallButton onClick={() => setOpenModal(true)}>Claim MOBI</SmallButton>
      </RowBetween>
      <RowBetween>
        <TYPE.subHeader>{unclaimedMobi.toSignificant(4)} Unclaimed MOBI</TYPE.subHeader>
      </RowBetween>
      <Divider />
      {loading ? (
        <AutoRow>
          <Loader style={{ margin: 'auto' }} />
        </AutoRow>
      ) : greaterThanZero.length > 0 ? (
        greaterThanZero.map((position) => (
          <PositionCard
            key={`positions-card-${position.pool}`}
            position={position}
            votingPower={stakingInfo.votingPower.raw}
            totalVotingPower={stakingInfo.totalVotingPower.raw}
          />
        ))
      ) : (
        <TYPE.largeHeader>You do not have any deposits</TYPE.largeHeader>
      )}
    </Container>
  )
}

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`

function PositionCard({
  position,
  votingPower,
  totalVotingPower,
}: {
  position: GaugeSummary
  votingPower: JSBI
  totalVotingPower: JSBI
}) {
  const backgroundColor = useColor(position.firstToken)
  const lpAsUsd = usePriceOfLp(position.pool, position.baseBalance)
  const [showMore, setShowMore] = useState(false)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const boost = calcBoost(position, votingPower, totalVotingPower)

  return (
    <>
      <GaugeVoteModal summary={position} isOpen={voteModalOpen} onDismiss={() => setVoteModalOpen(false)} />

      <Wrapper
        activated={showMore}
        showBackground={true}
        bgColor={backgroundColor}
        onClick={() => setShowMore(!showMore)}
      >
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color="white">{position.pool}</TYPE.mediumHeader>
          <TYPE.white color="white">{`$${lpAsUsd?.toSignificant(4)} Staked`}</TYPE.white>
        </RowBetween>
        {showMore && (
          <>
            <Divider bg="grey" />
            <RowBetween>
              <TYPE.white>Unclaimed MOBI</TYPE.white>
              <TYPE.white color="white">{`${position.unclaimedMobi.toFixed(2)} MOBI`}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white>Your actual share</TYPE.white>
              <TYPE.white>{`${position.actualPercentage.toSignificant(4)}%`}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white>Your share, accounted for boosts</TYPE.white>
              <TYPE.white>{`${position.workingPercentage.toSignificant(4)}%`}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white>Your Boost</TYPE.white>
              <TYPE.white>{`${boost.toFixed(0)}%`}</TYPE.white>
            </RowBetween>
          </>
        )}
      </Wrapper>
    </>
  )
}
