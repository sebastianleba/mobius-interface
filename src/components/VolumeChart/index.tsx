import 'react-vis/dist/style.css'

import React, { useState } from 'react'
import {
  DiscreteColorLegend,
  Highlight,
  HighlightArea,
  Hint,
  LineSeries,
  LineSeriesPoint,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis'
import styled from 'styled-components'
import { TYPE } from 'theme'

type DataPoint = { x: number; y: number }

const ToolTip = styled.div`
  background: ${({ theme }) => theme.bg1};
  padding: 0.5rem;
  border-radius: 15px;
`
interface VolumeChartProps {
  data: DataPoint[][]
  labels: string[]
  xLabelFormat: (num: number) => string
}

export default function VolumeChart({ data, labels, xLabelFormat }: VolumeChartProps) {
  const [area, setArea] = useState<HighlightArea | undefined | null>()
  const [hovered, setHovered] = useState<number>()
  const [hoverValue, setHoverValue] = useState<LineSeriesPoint>()
  console.log(hoverValue)
  return (
    <XYPlot
      //   animation
      xDomain={area && [area.left, area.right]}
      yDomain={area && [area.bottom, area.top]}
      width={1100}
      height={500}
      onMouseLeave={() => setHoverValue(undefined)}
    >
      {/* <HorizontalGridLines /> */}
      <DiscreteColorLegend
        items={labels}
        orientation="vertical"
        onItemMouseEnter={(item, index, event) => setHovered(index)}
        onItemMouseLeave={(item, index, event) => setHovered(undefined)}
      />
      <YAxis
        hideLine
        left={-75}
        width={120}
        tickPadding={0}
        title="Volume"
        tickFormat={(v) => {
          if (v < 1000) {
            return v
          }
          if (v < 10 ** 6) {
            return `${v / 1000}K`
          }
          if (v < 10 ** 10) {
            return `${(v / 10 ** 6).toFixed(1)}M`
          }
        }}
        style={{ text: { width: '10rem', zIndex: 999 } }}
      />
      <XAxis tickFormat={(v) => xLabelFormat(v)} title="Time" />
      {hoverValue && (
        <Hint value={hoverValue}>
          <ToolTip>
            <TYPE.body>{`${new Date(hoverValue?.x * 1000).toLocaleDateString()}`}</TYPE.body>
            <TYPE.body>${hoverValue.y.toLocaleString()}</TYPE.body>
          </ToolTip>
        </Hint>
      )}
      {data.map((entry, i) => (
        <LineSeries
          key={labels[i]}
          data={entry}
          opacity={hovered && hovered !== i ? 0.33 : 1}
          stack={true}
          onNearestXY={(point, info) => setHoverValue(point)}
          //   onValueMouseOut={() => setHoverValue(undefined)}
        />
      ))}
      <Highlight
        onBrushEnd={(newArea) => setArea(newArea)}
        onDrag={(newArea) => {
          newArea &&
            setArea({
              bottom: area.bottom + (newArea.top - newArea.bottom),
              left: area.left - (newArea.right - newArea.left),
              right: area.right - (newArea.right - newArea.left),
              top: area.top + (newArea.top - newArea.bottom),
            })
        }}
      />
    </XYPlot>
  )
}
