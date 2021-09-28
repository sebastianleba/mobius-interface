import { CardNoise } from 'components/claim/styled'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { useColor } from 'hooks/useColor'
import { useWindowSize } from 'hooks/useWindowSize'
import React, { useState } from 'react'
import { RadialChart } from 'react-vis'
import { GaugeSummary } from 'state/staking/hooks'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

import GaugeVoteModal from './GaugeVoteModal'

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; background: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
`}
margin-top: 1rem;
`
const WrappedRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
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

// TO DO: Account for Vote Power Allocations
export default function GaugeWeights({ summaries }: GaugeWeightsProps) {
  const data = summaries.map((summary) => ({
    label: summary.pool,
    angle: parseInt(summary.currentWeight.multiply('360').toFixed(0)),
    radius: summary.boostedBalance.greaterThan('0') ? 100 : 9,
    subLabel: `${summary.currentWeight.toFixed(2)}%`,
  }))
  const isDarkMode = useIsDarkMode()
  const { width, height } = useWindowSize()
  const leftToAllocate = 20

  return (
    <Wrapper>
      <RowBetween marginBottom="1rem">
        <TYPE.largeHeader>Governance</TYPE.largeHeader>
      </RowBetween>
      {data.length === 0 ? (
        <WrappedRow>
          <Loader />
        </WrappedRow>
      ) : (
        <>
          <AutoRow>
            <TYPE.body marginLeft="auto" marginRight="auto">
              Current Pool Weights
            </TYPE.body>{' '}
          </AutoRow>
          <WrappedRow>
            <RadialChart
              data={data}
              width={Math.min((width ?? 0) * 0.8, 600)}
              height={Math.min((width ?? 0) * 0.8, 600)}
              showLabels={true}
              labelsStyle={{ color: isDarkMode ? 'white' : 'black' }}
              labelsAboveChildren={true}
              labelsRadiusMultiplier={0.9}
              margin={0}
              style={{ margin: 0 }}
            />
          </WrappedRow>
          <AutoRow marginTop="1rem">
            <TYPE.mediumHeader>Vote for Pool Weights!</TYPE.mediumHeader>
          </AutoRow>
          <AutoRow>
            <TYPE.subHeader>Allocate your vote power to affect the MOBI distribution of each pool</TYPE.subHeader>
          </AutoRow>
          <CardContainer>
            {summaries.map((summary) => (
              <WeightCard position={summary} key={`weight-card-${summary.pool}`} />
            ))}
          </CardContainer>
        </>
      )}
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
  @media (min-width: 800px) {
    width: 49%;
  }
`

function WeightCard({ position }: { position: GaugeSummary }) {
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
          <TYPE.white color="white">{`Current: ${position.currentWeight.toFixed(2)}%`}</TYPE.white>
        </RowBetween>
      </PositionWrapper>
    </>
  )
}
