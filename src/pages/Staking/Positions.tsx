import { JSBI, TokenAmount } from '@ubeswap/sdk'
import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { CardNoise } from 'components/earn/styled'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { usePoolColor } from 'hooks/useColor'
import React, { useState } from 'react'
import { usePriceOfLp } from 'state/stablePools/hooks'
import { GaugeSummary, MobiStakingInfo } from 'state/staking/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { calcBoost } from 'utils/calcExpectedVeMobi'

import { useStablePoolInfo } from '../../state/stablePools/hooks'
import ClaimAllMobiModal from './ClaimAllMobiModal'
import GaugeVoteModal from './GaugeVoteModal'

const Container = styled.div`
  width: 100%;
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
const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background: ${({ bgColor }) => bgColor};
  color: ${({ theme }) => theme.white};
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
  const greaterThanZero = positions.filter(
    ({ baseBalance, unclaimedMobi }) => baseBalance.greaterThan('0') || unclaimedMobi.greaterThan('0')
  )
  const [openModal, setOpenModal] = useState(false)
  return (
    <Container>
      <ClaimAllMobiModal isOpen={openModal} onDismiss={() => setOpenModal(false)} summaries={greaterThanZero} />
      <RowBetween>
        <TYPE.largeHeader>Your Positions</TYPE.largeHeader>
        <TYPE.green style={{ paddingLeft: '.15rem' }} className="apr" fontWeight={800} fontSize={[18, 24]}>
          {unclaimedMobi.toSignificant(4)} Unclaimed MOBI
        </TYPE.green>
      </RowBetween>
      {JSBI.greaterThan(unclaimedMobi.raw, JSBI.BigInt(0)) && (
        <ButtonPrimary
          onClick={() => setOpenModal(true)}
          style={{ fontWeight: 700, fontSize: 18, marginTop: '1rem', marginBottom: '1rem' }}
        >
          CLAIM MOBI
        </ButtonPrimary>
      )}
      {loading ? (
        <AutoRow>
          <Loader style={{ margin: 'auto' }} />
        </AutoRow>
      ) : (
        greaterThanZero.map((position) => (
          <PositionCard
            key={`positions-card-${position.pool}`}
            position={position}
            votingPower={stakingInfo.votingPower.raw}
            totalVotingPower={stakingInfo.totalVotingPower.raw}
          />
        ))
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
  const lpAsUsd = usePriceOfLp(position.pool, position.baseBalance)
  const [voteModalOpen, setVoteModalOpen] = useState(false)
  const boost = calcBoost(position, votingPower, totalVotingPower)

  const stablePools = useStablePoolInfo()
  const poolInfo = stablePools.filter((x) => x.name === position.pool)[0]
  const poolColor = usePoolColor(poolInfo)

  return (
    <>
      <GaugeVoteModal summary={position} isOpen={voteModalOpen} onDismiss={() => setVoteModalOpen(false)} />

      <Wrapper showBackground={true} bgColor={poolColor} onClick={() => setShowMore(!showMore)}>
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color="white">{position.pool}</TYPE.mediumHeader>
          <TYPE.white color="white">{`$${lpAsUsd?.toSignificant(4)}`}</TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>Unclaimed MOBI</TYPE.white>
          <TYPE.white color="white">{`${position.unclaimedMobi.toFixed(2)} MOBI`}</TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>Your Boost</TYPE.white>
          <TYPE.white>{`${boost.toFixed(2)}x`}</TYPE.white>
        </RowBetween>
      </Wrapper>
    </>
  )
}
