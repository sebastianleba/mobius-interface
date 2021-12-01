import 'react-vis/dist/style.css'

import React, { useState } from 'react'
import { DiscreteColorLegend, Highlight, HighlightArea, LineSeries, XAxis, XYPlot, YAxis } from 'react-vis'

type DataPoint = { x: number; y: number }
interface VolumeChartProps {
  data: DataPoint[][]
  labels: string[]
  xLabelFormat: (num: number) => string
}

export default function VolumeChart({ data, labels, xLabelFormat }: VolumeChartProps) {
  const [area, setArea] = useState<HighlightArea | undefined | null>()
  const [hovered, setHovered] = useState<number>()
  return (
    <XYPlot
      //   animation
      xDomain={area && [area.left, area.right]}
      yDomain={area && [area.bottom, area.top]}
      width={1100}
      height={500}
    >
      {/* <HorizontalGridLines /> */}
      <DiscreteColorLegend
        items={labels}
        orientation="vertical"
        onItemMouseEnter={(item, index, event) => setHovered(index)}
        onItemMouseLeave={(item, index, event) => setHovered(undefined)}
      />
      <YAxis tickPadding={0} title="Volume" style={{ zIndex: 999 }} />
      <XAxis tickFormat={(v) => xLabelFormat(v)} />

      {data.map((entry, i) => (
        <LineSeries key={labels[i]} data={entry} opacity={hovered && hovered !== i ? 0.33 : 1} stack={true} />
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
