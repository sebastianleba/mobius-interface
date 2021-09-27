import { TokenAmount } from '@ubeswap/sdk'
import { useMobi } from 'hooks/Tokens'
import { useWindowSize } from 'hooks/useWindowSize'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { useMobiStakingInfo, usePriceOfDeposits } from 'state/staking/hooks'
import styled from 'styled-components'

import GradientTextBox from '../../components/Visx/GradientTextBox'
import { getAllUnclaimedMobi } from './ClaimAllMobiModal'
import Positions from './Positions'
import Stake from './Stake'

const TextContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
`

const PositionsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`

const OuterContainer = styled.div`
  width: min(1280px, 100%);
  margin-top: ${!isMobile ? '3rem' : '-2rem'};
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.text1};
  margin-top: 1rem;
  margin-bottom: 2rem;
  opacity: 0.2;
`
export default function Staking() {
  const stakingInfo = useMobiStakingInfo()
  const priceOfDeposits = usePriceOfDeposits()
  const { width, height } = useWindowSize()
  const mobi = useMobi()
  const unclaimedMobi = new TokenAmount(mobi, getAllUnclaimedMobi(stakingInfo.positions ?? []))

  const outerPieData =
    stakingInfo.positions?.map((info) => ({
      label: info.pool,
      value: parseInt(info.boostedBalance.toExact()),
    })) ?? []
  const innerPieData =
    stakingInfo.positions?.map((info) => ({
      label: info.pool,
      value: parseInt(info.totalStaked.toExact()),
    })) ?? []

  const displayData = [
    {
      label: 'Your Voting Power',
      value: stakingInfo.votingPower.toSignificant(4),
    },
    {
      label: 'Total Voting Power',
      value: stakingInfo.totalVotingPower.toSignificant(4),
    },
    {
      label: 'Your total deposits',
      value: '$' + priceOfDeposits.toSignificant(4),
    },
    {
      label: 'Unclaimed Mobi',
      value: unclaimedMobi.toSignificant(4),
    },
  ]
  if (width && width > 1280) {
    displayData.push(
      {
        label: 'Mobi Locked',
        value: stakingInfo.mobiLocked?.toSignificant(4) ?? '0',
      },
      {
        label: 'Lock Ends',
        value:
          stakingInfo.lockEnd && stakingInfo.lockEnd.valueOf() > 0 ? stakingInfo.lockEnd.toLocaleDateString() : 'N/A',
      }
    )
  }
  return (
    <OuterContainer>
      <TextContainer>
        {displayData.map(({ label, value }, i) => (
          <GradientTextBox
            i={i}
            label={label}
            value={value}
            id={`staking-info-text-${i}`}
            key={`staking-info-text-${i}`}
          />
        ))}
      </TextContainer>
      <Divider />
      <PositionsContainer>
        <Stake stakingInfo={stakingInfo} />
        <Positions stakingInfo={stakingInfo} unclaimedMobi={unclaimedMobi} />
        {/* <DoublePieChart
          width={Math.min((width ?? 600) * 0.95, 600)}
          height={Math.min((width ?? 600) * 0.95, 600)}
          innerChartData={innerPieData}
          outerChartData={outerPieData}
        /> */}
      </PositionsContainer>
    </OuterContainer>
  )
}
