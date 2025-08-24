"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { BarChart3, Search, TrendingDown, TrendingUp, Upload, Video } from "lucide-react"

const cards = [
  {
    title: "Total Videos",
    value: "24",
    change: "+12%",
    icon: Video,
    description: "Uploaded this month",
    trending: "up"
  },
  {
    title: "Search Queries",
    value: "1,247", 
    change: "+18%",
    icon: Search,
    description: "Processed this week",
    trending: "up"
  },
  {
    title: "Processing Credits",
    value: "156",
    change: "-5%",
    icon: Upload,
    description: "Remaining credits",
    trending: "down"
  },
  {
    title: "Search Accuracy",
    value: "94.2%",
    change: "+2.1%",
    icon: BarChart3,
    description: "Average match rate",
    trending: "up"
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-sm font-medium">
              {card.title}
            </CardDescription>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {card.value}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="gap-1">
                {card.trending === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.change}
              </Badge>
            </div>
            <div className="text-muted-foreground">
              {card.description}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
