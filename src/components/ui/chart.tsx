"use client"

import * as React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Grid } from "@visx/grid"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import { BarGroup } from "@visx/shape"
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip"

import { cn } from "../../../lib/utils"

const tooltipStyles = {
  ...defaultStyles,
  background: "var(--background)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  zIndex: 40,
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[]
  keys: string[]
  index: string
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  children: React.ReactNode
}

export function Chart({
  data,
  keys,
  index,
  height = 400,
  margin = { top: 20, right: 20, bottom: 50, left: 50 },
  className,
  children,
  ...props
}: ChartProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const width = 600 // Fixed width, you might want to make this responsive

  const xScale = React.useMemo(
    () =>
      scaleBand<string>({
        domain: data.map((d) => d[index]),
        padding: 0.2,
      }),
    [data, index]
  )

  const yScale = React.useMemo(
    () =>
      scaleLinear<number>({
        domain: [
          0,
          Math.max(
            ...data.map((d) => Math.max(...keys.map((key) => Number(d[key]))))
          ),
        ],
      }),
    [data, keys]
  )

  const colorScale = React.useMemo(
    () =>
      scaleOrdinal({
        domain: keys,
        range: [
          "var(--chart-primary)",
          "var(--chart-secondary)",
          "var(--chart-tertiary)",
          "var(--chart-quaternary)",
        ],
      }),
    [keys]
  )

  xScale.rangeRound([0, width - margin.left - margin.right])
  yScale.range([height - margin.top - margin.bottom, 0])

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Group top={margin.top} left={margin.left}>
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            stroke="var(--border)"
            strokeOpacity={0.1}
          />
          <AxisBottom
            top={height - margin.top - margin.bottom}
            scale={xScale}
            stroke="var(--foreground)"
            tickStroke="var(--foreground)"
            tickLabelProps={{
              fill: "var(--foreground)",
              fontSize: 12,
              textAnchor: "middle",
            }}
          />
          <AxisLeft
            scale={yScale}
            stroke="var(--foreground)"
            tickStroke="var(--foreground)"
            tickLabelProps={{
              fill: "var(--foreground)",
              fontSize: 12,
              textAnchor: "end",
              dy: "0.33em",
              dx: -4,
            }}
          />
          <BarGroup
            data={data}
            keys={keys}
            height={height - margin.top - margin.bottom}
            x0={index}
            x0Scale={xScale}
            x1Scale={scaleBand({
              domain: keys,
              padding: 0.1,
            })}
            yScale={yScale}
            color={colorScale}
          />
        </Group>
      </svg>
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  formattedValue: string
}

export function ChartTooltip({
  formattedValue,
  ...props
}: ChartTooltipProps) {
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  })

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip()

  return (
    <div ref={containerRef}>
      {tooltipOpen && (
        <TooltipInPortal
          left={tooltipLeft}
          top={tooltipTop}
          style={tooltipStyles}
          {...props}
        >
          {formattedValue}
        </TooltipInPortal>
      )}
    </div>
  )
}

export { ChartTooltip as Tooltip, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"

