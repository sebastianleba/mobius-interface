import { gql, useQuery } from '@apollo/client'
import { RowBetween } from 'components/Row'
import Toggle from 'components/Toggle'
import VolumeChart from 'components/VolumeChart'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { usePools } from 'state/stablePools/hooks'
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

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.text1};
  margin-top: 1rem;
  margin-bottom: 2rem;
  opacity: 0.2;
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

export default function Charts() {
  const { data, loading, error } = useQuery(volumeQuery)
  const [granularity, setGranularity] = useState<Granularity>(Granularity.Day)
  const [selectedPools, setSelectedPools] = useState<Set<string>>(new Set())
  const pools = usePools()

  useEffect(() => {
    console.log(data)
  }, [data, loading])

  const genData = () => {
    if (!data) return []
    return data.swaps
      .filter(({ id }: { id: string }) => selectedPools.has(id))
      .map(({ dailyVolumes }) =>
        dailyVolumes.map((vol) => ({
          x: parseInt(vol.timestamp),
          y: parseInt(vol.volume),
        }))
      )
  }

  return (
    <OuterContainer>
      {pools.map((p) => (
        <RowBetween key={`charts-${p.name}`}>
          <TYPE.mediumHeader>{p.name}</TYPE.mediumHeader>
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
        </RowBetween>
      ))}
      {!loading && !error && (
        <VolumeChart data={genData()} labels={[...selectedPools]} xLabelFormat={timeFormat[Granularity.Day]} />
      )}
    </OuterContainer>
  )
}
