import { TokenAmount } from '@ubeswap/sdk'
import { useMobi } from 'hooks/Tokens'
import { useWindowSize } from 'hooks/useWindowSize'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { useMobiStakingInfo, usePriceOfDeposits } from 'state/staking/hooks'
import styled from 'styled-components'

import { Row } from '../../components/Row'
import GradientTextBox from '../../components/Visx/GradientTextBox'
import CalcBoost from './CalcBoost'
import { getAllUnclaimedMobi } from './ClaimAllMobiModal'
import GaugeWeights from './GaugeWeights'
import Positions from './Positions'
import Stake from './Stake'
import Vote from './Vote'

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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const OuterContainer = styled.div`
  width: min(1280px, 100%);
  margin-top: ${!isMobile ? '3rem' : '-2rem'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.text1};
  margin-top: 1rem;
  margin-bottom: 2rem;
  opacity: 0.2;
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;  
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg1};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
`

const Sel = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: ${({ selected }) => (selected ? '12px' : '3rem')};
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme, selected }) => (selected ? theme.white : theme.text1)};
  font-size: 1rem;
  font-weight: ${({ selected }) => (selected ? '999' : '300')};
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  background-color: ${({ theme, selected }) => (selected ? theme.celoGreen : theme.bg1)};
`

enum View {
  Lock,
  Vote,
  Analyze,
}

export default function Staking() {
  const stakingInfo = useMobiStakingInfo()
  const priceOfDeposits = usePriceOfDeposits()
  const { width, height } = useWindowSize()
  const mobi = useMobi()
  const unclaimedMobi = new TokenAmount(mobi, getAllUnclaimedMobi(stakingInfo.positions ?? []))

  const [view, setView] = React.useState<View>(View.Lock)

  const displayData = [
    {
      label: 'Your Voting Power',
      value: stakingInfo.votingPower.toSignificant(4, { groupSeparator: ',' }),
    },
    {
      label: 'Total Voting Power',
      value: stakingInfo.totalVotingPower.toSignificant(4, { groupSeparator: ',' }),
    },
    {
      label: 'Your total deposits',
      value: '$' + priceOfDeposits.toSignificant(4, { groupSeparator: ',' }),
    },
    {
      label: 'Unclaimed Mobi',
      value: unclaimedMobi.toSignificant(4, { groupSeparator: ',' }),
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
      <div style={{ alignItems: 'center', marginBottom: '1rem', marginTop: '1rem', display: 'flex' }}>
        <HeaderLinks>
          <Sel onClick={() => setView(View.Lock)} selected={view === View.Lock}>
            Lock
          </Sel>
          <Sel onClick={() => setView(View.Vote)} selected={view === View.Vote}>
            Vote
          </Sel>
          <Sel onClick={() => setView(View.Analyze)} selected={view === View.Analyze}>
            Analyze
          </Sel>
        </HeaderLinks>
      </div>
      {view === View.Lock ? (
        <PositionsContainer>
          <Stake stakingInfo={stakingInfo} />
          <CalcBoost stakingInfo={stakingInfo} unclaimedMobi={unclaimedMobi} />
        </PositionsContainer>
      ) : view === View.Vote ? (
        <PositionsContainer>
          <Vote summaries={stakingInfo.positions ?? []} />
        </PositionsContainer>
      ) : (
        <PositionsContainer>
          <Positions stakingInfo={stakingInfo} unclaimedMobi={unclaimedMobi} />
          <GaugeWeights summaries={stakingInfo.positions ?? []} />
        </PositionsContainer>
      )}
    </OuterContainer>
  )
}
