import { gql, useQuery } from '@apollo/client'
import { AutoColumn } from 'components/Column'
import Logo from 'components/Logo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import VolumeChart from 'components/VolumeChart'
import { ChainLogo, Coins, PRICE } from 'constants/StablePools'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { usePools } from 'state/stablePools/hooks'
import { StableSwapPool } from 'state/stablePools/reducer'
import styled from 'styled-components'
import { TYPE } from 'theme'

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
  align-items: flex-start;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}
  flex-wrap: wrap;
`

const OuterContainer = styled.div`
  width: min(1280px, 100%);
  margin-top: ${!isMobile ? '3rem' : '-1rem'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const PoolSelection = styled(RowBetween)`
  width: 25rem;
  padding: 0.5rem;
  background: ${({ theme }) => theme.bg1};
  margin: 0.1rem;
  border-radius: 10px;
`
const volumeQuery = gql`
  {
    swaps {
      id
      tokens {
        id
        name
      }
      hourlyVolumes {
        volume
        timestamp
      }
      dailyVolumes {
        volume
        timestamp
      }
      weeklyVolumes {
        volume
        timestamp
      }
    }
  }
`
enum Granularity {
  Hour,
  Day,
  Week,
}

const timeFormat: { [g: Granularity]: (n: number) => string } = {
  [Granularity.Hour]: (t: number) => new Date(t * 1000).getHours(),
  [Granularity.Day]: (t: number) => new Date(t * 1000).getDate(),
  [Granularity.Week]: (t: number) => new Date(t * 1000).getDate(),
}

function getPoolName(pools: StableSwapPool[], address: string) {
  return pools.filter((p) => p.address.toLowerCase() == address)[0]?.name ?? 'Unknown'
}

export default function Charts() {
  const { data, loading, error } = useQuery(volumeQuery)
  const [granularity, setGranularity] = useState<Granularity>(Granularity.Day)
  const [showTotal, setShowTotal] = useState(true)
  const [selectedPools, setSelectedPools] = useState<Set<string>>(new Set())
  const pools = usePools().slice()

  useEffect(() => {
    console.log(data)
  }, [data, loading])

  const totals = data
    ? data.swaps.reduce((accum, info) => {
        const price =
          info.id === '0x19260b9b573569dDB105780176547875fE9fedA3'.toLowerCase()
            ? PRICE[Coins.Bitcoin]
            : info.id === '0xE0F2cc70E52f05eDb383313393d88Df2937DA55a'.toLowerCase()
            ? PRICE[Coins.Ether]
            : PRICE[Coins.USD]
        info.weeklyVolumes.forEach((vol, i) => {
          accum[vol.timestamp] = price * parseInt(vol.volume) + (accum[vol.timestamp] ?? 0)
        })
        return accum
      }, {})
    : undefined
  console.log(totals)

  const dataAndLabels = data
    ? data.swaps
        .filter(({ id }: { id: string }) => selectedPools.has(id))
        .map(({ id, weeklyVolumes }) => [
          getPoolName(pools, id),
          weeklyVolumes.map((vol) => ({
            x: parseInt(vol.timestamp),
            y: parseInt(vol.volume),
          })),
        ])
    : []

  if (showTotal && totals) {
    dataAndLabels.push(['Total', Object.entries(totals).map(([time, vol]) => ({ x: time, y: vol }))])
    console.log(dataAndLabels)
  }
  const chartData = dataAndLabels.map((group) => group[1])
  const labels = dataAndLabels.map((group) => group[0])

  return (
    <OuterContainer>
      <Row>
        {!loading && !error && (
          <VolumeChart data={chartData} labels={labels} xLabelFormat={timeFormat[Granularity.Day]} />
        )}
        <AutoColumn>
          <PoolSelection>
            <RowFixed>
              <TYPE.mediumHeader>Total</TYPE.mediumHeader>
            </RowFixed>
            <Toggle isActive={showTotal} toggle={() => setShowTotal(!showTotal)} />
          </PoolSelection>

          {pools
            .sort((p1, p2) => p1.displayChain - p2.displayChain)
            .filter(({ disabled }) => !disabled)
            .map((p) => (
              <PoolSelection key={`charts-${p.name}`}>
                <RowFixed>
                  <StyledLogo size={'32px'} srcs={[ChainLogo[p.displayChain]]} alt={'logo'} />{' '}
                  <TYPE.mediumHeader style={{ marginLeft: '0.2rem' }}>{p.name}</TYPE.mediumHeader>
                </RowFixed>
                <Toggle
                  isActive={selectedPools.has(p.address.toLowerCase())}
                  toggle={() => {
                    const newSet = new Set(selectedPools)
                    if (selectedPools.has(p.address.toLowerCase())) {
                      newSet.delete(p.address.toLowerCase())
                    } else {
                      newSet.add(p.address.toLowerCase())
                    }
                    setSelectedPools(newSet)
                  }}
                />
              </PoolSelection>
            ))}
        </AutoColumn>
      </Row>
    </OuterContainer>
  )
}
