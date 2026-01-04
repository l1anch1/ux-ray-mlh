"use client"

import { 
  Eye, 
  Layers, 
  CheckCircle,
  XCircle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Award
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface CategoryScore {
  score: number
  comment: string
}

export interface AuditResult {
  score: number
  summary: string
  categories: {
    visualHierarchy: CategoryScore
    accessibility: CategoryScore
    consistency: CategoryScore
  }
  criticalIssues: string[]
  quickFixes: string[]
}

interface AuditReportProps {
  result: AuditResult
}

const categoryConfig = {
  visualHierarchy: {
    icon: Layers,
    label: "Visual Hierarchy",
    emoji: "👁️",
  },
  accessibility: {
    icon: Eye,
    label: "Accessibility",
    emoji: "♿",
  },
  consistency: {
    icon: CheckCircle,
    label: "Consistency",
    emoji: "🎨",
  },
}

function ScoreBadge({ score, summary }: { score: number; summary: string }) {
  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", label: "Outstanding", icon: Award }
    if (score >= 80) return { grade: "A", label: "Excellent", icon: TrendingUp }
    if (score >= 70) return { grade: "B", label: "Good", icon: TrendingUp }
    if (score >= 60) return { grade: "C", label: "Fair", icon: Minus }
    if (score >= 50) return { grade: "D", label: "Poor", icon: TrendingDown }
    return { grade: "F", label: "Critical", icon: Flame }
  }

  const getColors = (score: number) => {
    if (score >= 80) return {
      bg: "from-emerald-500/20 to-emerald-600/20",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    }
    if (score >= 60) return {
      bg: "from-amber-500/20 to-amber-600/20",
      border: "border-amber-500/50",
      text: "text-amber-400",
      glow: "shadow-amber-500/20",
    }
    return {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/50",
      text: "text-red-400",
      glow: "shadow-red-500/20",
    }
  }

  const gradeInfo = getGrade(score)
  const colors = getColors(score)
  const GradeIcon = gradeInfo.icon

  return (
    <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-2xl ${colors.glow}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${colors.bg} blur-3xl opacity-50`} />
      </div>

      <div className="relative flex items-center gap-8">
        {/* Score circle */}
        <div className="relative">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} border-4 ${colors.border} flex items-center justify-center`}>
            <div className="text-center">
              <span className={`text-5xl font-black ${colors.text}`}>{score}</span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          {/* Grade badge */}
          <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-background border ${colors.border} ${colors.text} font-bold text-sm flex items-center gap-1`}>
            <GradeIcon className="w-3 h-3" />
            {gradeInfo.grade}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant={score >= 70 ? "success" : score >= 50 ? "warning" : "critical"}
              className="text-xs font-bold uppercase tracking-wider"
            >
              {gradeInfo.label}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold mb-3">Design Verdict</h2>
          <p className={`text-lg leading-relaxed ${colors.text} font-bold font-mono`}>
            &ldquo;{summary}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}

function CategorySection({ result }: { result: AuditResult }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-400"
    if (score >= 60) return "bg-amber-400"
    return "bg-red-400"
  }

  return (
    <Accordion type="single" collapsible defaultValue="categories" className="space-y-3">
      <AccordionItem value="categories" className="border rounded-xl bg-card/50 overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <span className="font-semibold">Category Breakdown</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="space-y-4">
            {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
              const config = categoryConfig[key]
              const category = result.categories[key]
              
              return (
                <div key={key} className="p-4 rounded-xl bg-background/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.emoji}</span>
                      <span className="font-semibold">{config.label}</span>
                    </div>
                    <span className={`text-2xl font-black ${getScoreColor(category.score)}`}>
                      {category.score}
                    </span>
                  </div>
                  <Progress 
                    value={category.score} 
                    className="h-2 mb-3"
                    indicatorClassName={getProgressColor(category.score)}
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {category.comment}
                  </p>
                </div>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function AuditReport({ result }: AuditReportProps) {
  return (
    <div className="space-y-6">
      {/* Giant Score Badge */}
      <ScoreBadge score={result.score} summary={result.summary} />

      {/* Category Breakdown */}
      <CategorySection result={result} />

      {/* Critical Issues */}
      {result.criticalIssues.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold">Critical Issues</span>
                <p className="text-sm font-normal text-red-400/70 mt-0.5">
                  Fix these ASAP before your demo
                </p>
              </div>
              <Badge variant="critical" className="ml-auto">
                {result.criticalIssues.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.criticalIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-red-500/20">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 text-red-400 text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed pt-1">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Fixes */}
      {result.quickFixes.length > 0 && (
        <Card className="border-accent/30 bg-accent/5 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-accent">
              <div className="p-2 rounded-lg bg-accent/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold">Quick Fixes</span>
                <p className="text-sm font-normal text-accent/70 mt-0.5">
                  Low-effort, high-impact improvements
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.quickFixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-accent/20">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center">
                    ✓
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed pt-1">{fix}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pro tip */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <p className="text-sm text-muted-foreground">
          💡 <span className="text-primary font-medium">Pro tip:</span> Focus on critical issues first, then quick fixes. 
          Small improvements compound into great UX.
        </p>
      </div>
    </div>
  )
}
