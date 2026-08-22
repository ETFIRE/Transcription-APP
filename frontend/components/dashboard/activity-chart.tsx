"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { meetingsPerWeek } from "@/lib/stats"
import type { Meeting } from "@/lib/types"

export function ActivityChart({ meetings }: { meetings: Meeting[] }) {
  const data = meetingsPerWeek(meetings)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Meeting activity</CardTitle>
        <CardDescription>Sessions captured over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: { label: "Meetings", color: "var(--chart-1)" },
          }}
          className="h-[200px] w-full"
        >
          <AreaChart accessibilityLayer data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              dataKey="count"
              type="monotone"
              stroke="var(--color-count)"
              fill="url(#fillCount)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
