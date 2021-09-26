import { GradientDarkgreenGreen } from '@visx/gradient'
import { Group } from '@visx/group'
import { scaleOrdinal } from '@visx/scale'
import Pie, { PieArcDatum, ProvidedProps } from '@visx/shape/lib/shapes/Pie'
import React, { useState } from 'react'
import { animated, interpolate, useTransition } from 'react-spring'
import styled from 'styled-components'

export interface PieSection {
  label: string
  value: number
}

const SVG = styled.svg`
  width: 100%;
  height: 50rem;
`

// color scales
const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 }

export type PieProps = {
  width: number
  height: number
  margin?: typeof defaultMargin
  animate?: boolean
  innerChartData: PieSection[]
  outerChartData: PieSection[]
}

export default function DoublePieChart({
  width,
  height,
  innerChartData,
  outerChartData,
  margin = defaultMargin,
  animate = true,
}: PieProps) {
  console.log({
    innerChartData,
    outerChartData,
  })
  const outerLabels = outerChartData.map(({ label }) => label)
  const innerLabels = innerChartData.map(({ label }) => label)
  const getOuterColor = scaleOrdinal({
    domain: outerLabels,
    range: [
      'rgba(255,255,255,0.7)',
      'rgba(255,255,255,0.6)',
      'rgba(255,255,255,0.5)',
      'rgba(255,255,255,0.4)',
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0.2)',
      'rgba(255,255,255,0.1)',
    ],
  })
  const getInnerColor = scaleOrdinal({
    domain: innerLabels,
    range: [
      'rgba(93,30,91,1)',
      'rgba(93,30,91,0.9)',
      'rgba(93,30,91,0.8)',
      'rgba(93,30,91,0.7)',
      'rgba(93,30,91,0.6)',
      'rgba(93,30,91,0.5)',
      'rgba(93,30,91,0.4)',
      'rgba(93,30,91,0.3)',
      'rgba(93,30,91,0.2)',
      'rgba(93,30,91,0.1)',
    ],
  })

  const [selectedOuter, setSelectedOuter] = useState<string | null>(null)
  const [selectedInner, setSelectedInner] = useState<string | null>(null)

  if (width < 10) return null

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const radius = Math.min(innerWidth, innerHeight) / 2
  const centerY = innerHeight / 2
  const centerX = innerWidth / 2
  const donutThickness = 50

  return (
    <svg width={width} height={height}>
      <GradientDarkgreenGreen id="visx-pie-gradient" />
      <rect rx={14} width={width} height={height} fill="url('#visx-pie-gradient')" />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={selectedOuter ? outerChartData.filter(({ label }) => label === selectedOuter) : outerChartData}
          pieValue={(e: PieSection) => e.value}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie<PieSection>
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.label}
              onClickDatum={({ data: { label } }) =>
                animate && setSelectedOuter(selectedOuter && selectedOuter === label ? null : label)
              }
              getColor={(arc) => getOuterColor(arc.data.label)}
            />
          )}
        </Pie>
        <Pie
          data={selectedInner ? innerChartData.filter(({ label }) => label === selectedInner) : innerChartData}
          pieValue={(e: PieSection) => e.value}
          pieSortValues={() => -1}
          outerRadius={radius - donutThickness * 1.3}
        >
          {(pie) => (
            <AnimatedPie<PieSection>
              {...pie}
              animate={animate}
              getKey={({ data: { label } }) => label}
              onClickDatum={({ data: { label } }) =>
                animate && setSelectedInner(selectedInner && selectedInner === label ? null : label)
              }
              getColor={({ data: { label } }) => getInnerColor(label)}
            />
          )}
        </Pie>
      </Group>
      {animate && (
        <text
          textAnchor="end"
          x={width - 16}
          y={height - 16}
          fill="white"
          fontSize={11}
          fontWeight={300}
          pointerEvents="none"
        >
          Click segments to update
        </text>
      )}
    </svg>
  )
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number }

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
})
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
})

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean
  getKey: (d: PieArcDatum<Datum>) => string
  getColor: (d: PieArcDatum<Datum>) => string
  onClickDatum: (d: PieArcDatum<Datum>) => void
  delay?: number
}

function AnimatedPie<Datum>({ animate, arcs, path, getKey, getColor, onClickDatum }: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  })
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc)
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={9}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    )
  })
}
