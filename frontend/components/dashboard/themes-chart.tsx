"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { themeCounts } from "@/lib/stats"
import type { Meeting } from "@/lib/types"

export function ThemesChart({ meetings }: { meetings: Meeting[] }) {
  const data = themeCounts(meetings).slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dominant themes</CardTitle>
        <CardDescription>Most discussed topics across your meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: { label: "Meetings", color: "var(--chart-1)" },
          }}
          className="h-[240px] w-full"
        >
          <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <YAxis
              dataKey="theme"
              type="category"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 12 }}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
