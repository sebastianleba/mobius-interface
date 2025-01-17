import { CardNoise } from 'components/claim/styled'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { useColor } from 'hooks/useColor'
import { useWindowSize } from 'hooks/useWindowSize'
import { darken } from 'polished'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
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

const ColorBox = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  width: 20px;
  height: 20px;
  border-radius: 6px;
  margin-right: 1rem;
  margin-bottom: 0.25rem;
`

const colorsForChart = ['#35D07F', '#73DDFF', '#BF97FF', '#3488EC', '#FB7C6D', '#FBCC5C', '#FEF2D6']

interface GaugeWeightsProps {
  summaries: GaugeSummary[]
}

// TO DO: Account for Vote Power Allocations
export default function GaugeWeights({ summaries }: GaugeWeightsProps) {
  const numColors = colorsForChart.length
  const data = summaries.map((summary, i) => ({
    label: summary.pool,
    angle: parseInt(summary.currentWeight.multiply('360').toFixed(0)),
    radius: summary.workingBalance.greaterThan('0') ? 10 : 9.5,
    subLabel: `${summary.currentWeight.toFixed(2)}%`,
    color: darken(Math.floor(i / numColors) * 0.2, colorsForChart[i % numColors]),
  }))
  const isDarkMode = useIsDarkMode()
  const { width, height } = useWindowSize()

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
              colorType="literal"
              data={data}
              width={Math.min((width ?? 0) * 0.8, 600)}
              height={Math.min((width ?? 0) * 0.8, 600)}
              margin={0}
              style={{ marginLeft: 'auto' }}
            />
            {!isMobile && (
              <RowBetween style={{ flexWrap: 'wrap', maxWidth: '20rem' }}>
                {data.map(({ label, subLabel, color }) => (
                  <RowFixed key={`legend-${label}`} style={{ width: '49%' }}>
                    <ColorBox color={color} /> <TYPE.subHeader>{label}</TYPE.subHeader>
                  </RowFixed>
                ))}
              </RowBetween>
            )}
          </WrappedRow>
          {isMobile && (
            <RowBetween style={{ flexWrap: 'wrap', maxWidth: '20rem', marginRight: 'auto', marginLeft: 'auto' }}>
              {data.map(({ label, subLabel, color }) => (
                <RowFixed key={`legend-${label}`} style={{ width: '49%' }}>
                  <ColorBox color={color} /> <TYPE.subHeader>{label}</TYPE.subHeader>
                </RowFixed>
              ))}
            </RowBetween>
          )}
        </>
      )}
    </Wrapper>
  )
}

const PositionWrapper = styled(AutoColumn)<{
  showBackground: boolean
  bgColor: any
  activated: boolean
  disabled: boolean
}>`
  border-radius: 12px;
  width: 100%;
  height: fit-content;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
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
const RowWithGap = styled(RowFixed)`
  gap: 8px;
`

function WeightCard({
  position,
  showUserVote,
  disabled,
}: {
  position: GaugeSummary
  showUserVote: boolean
  disabled: boolean
}) {
  const backgroundColor = useColor(position.firstToken)
  const [voteModalOpen, setVoteModalOpen] = useState(false)

  return (
    <>
      <GaugeVoteModal summary={position} isOpen={voteModalOpen} onDismiss={() => setVoteModalOpen(false)} />

      <PositionWrapper
        activated={voteModalOpen}
        showBackground={true}
        bgColor={backgroundColor}
        disabled={disabled}
        onClick={() => !disabled && setVoteModalOpen(true)}
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
