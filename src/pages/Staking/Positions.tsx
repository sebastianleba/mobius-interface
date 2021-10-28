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
  overflow: hidden;
  position: relative;
  border-width: medium;
  border-style: solid;
  border-color: ${({ bgColor }) => bgColor};
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
      <RowBetween style={{ marginBottom: '1rem' }}>
        <TYPE.largeHeader>Your Positions</TYPE.largeHeader>
        <TYPE.green style={{ paddingLeft: '.15rem' }} className="apr" fontWeight={800} fontSize={[18, 24]}>
          {unclaimedMobi.toSignificant(4)} Unclaimed MOBI
        </TYPE.green>
      </RowBetween>
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
      {JSBI.greaterThan(unclaimedMobi.raw, JSBI.BigInt(0)) && (
        <ButtonPrimary
          onClick={() => setOpenModal(true)}
          style={{ fontWeight: 700, fontSize: 18, marginBottom: '1rem' }}
        >
          CLAIM MOBI
        </ButtonPrimary>
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

      <Wrapper showBackground={true} bgColor={poolColor}>
        <CardNoise />
        <RowBetween>
          <TYPE.mediumHeader color={'black'}>{position.pool}</TYPE.mediumHeader>
          <TYPE.black>{`$${lpAsUsd?.toSignificant(4)}`}</TYPE.black>
        </RowBetween>
        <RowBetween>
          <TYPE.black>Unclaimed MOBI</TYPE.black>
          <TYPE.black>{`${position.unclaimedMobi.toFixed(2)} MOBI`}</TYPE.black>
        </RowBetween>
        <RowBetween>
          <TYPE.black>Your Boost</TYPE.black>
          <TYPE.black>{`${boost.toFixed(2)}x`}</TYPE.black>
        </RowBetween>
      </Wrapper>
    </>
  )
}
