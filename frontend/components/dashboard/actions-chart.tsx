"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { actionStatusCounts } from "@/lib/stats"
import type { Meeting } from "@/lib/types"

export function ActionsChart({ meetings }: { meetings: Meeting[] }) {
  const { open, inProgress, done } = actionStatusCounts(meetings)
  const data = [
    { status: "Open", value: open, fill: "var(--chart-4)" },
    { status: "In progress", value: inProgress, fill: "var(--chart-2)" },
    { status: "Done", value: done, fill: "var(--chart-1)" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Action items</CardTitle>
        <CardDescription>Status of tasks captured from meetings</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <ChartContainer
          config={{
            value: { label: "Actions" },
            Open: { label: "Open", color: "var(--chart-4)" },
            "In progress": { label: "In progress", color: "var(--chart-2)" },
            Done: { label: "Done", color: "var(--chart-1)" },
          }}
          className="h-[180px] w-[180px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="status" innerRadius={48} strokeWidth={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="flex flex-col gap-3">
          {data.map((d) => (
            <li key={d.status} className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-full" style={{ backgroundColor: d.fill }} aria-hidden />
              <span className="text-muted-foreground">{d.status}</span>
              <span className="ml-auto font-medium tabular-nums">{d.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
