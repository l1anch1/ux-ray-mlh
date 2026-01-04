"use client"

import { 
  AlertTriangle, 
  Eye, 
  Layers, 
  Lightbulb, 
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
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

export interface AuditIssue {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  location?: string
  suggestion: string
}

export interface AuditCategory {
  name: string
  score: number
  issues: AuditIssue[]
}

export interface AuditResult {
  overallScore: number
  summary: string
  categories: {
    accessibility: AuditCategory
    visualHierarchy: AuditCategory
    usability: AuditCategory
    consistency: AuditCategory
  }
  topRecommendations: string[]
}

interface AuditReportProps {
  result: AuditResult
}

const severityConfig = {
  critical: {
    badge: "critical" as const,
    icon: XCircle,
    label: "Critical",
  },
  warning: {
    badge: "warning" as const,
    icon: AlertCircle,
    label: "Warning",
  },
  info: {
    badge: "info" as const,
    icon: AlertTriangle,
    label: "Info",
  },
}

const categoryConfig = {
  accessibility: {
    icon: Eye,
    label: "Accessibility",
    description: "Screen reader, contrast, and WCAG compliance",
  },
  visualHierarchy: {
    icon: Layers,
    label: "Visual Hierarchy",
    description: "Layout, spacing, and visual flow",
  },
  usability: {
    icon: Target,
    label: "Usability",
    description: "User interaction and task completion",
  },
  consistency: {
    icon: CheckCircle,
    label: "Consistency",
    description: "Design patterns and component uniformity",
  },
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const getColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-400"
    if (score >= 60) return "stroke-amber-400"
    return "stroke-red-400"
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`${getColor(score)} transition-all duration-1000`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

function CategoryCard({ 
  categoryKey, 
  category 
}: { 
  categoryKey: keyof typeof categoryConfig
  category: AuditCategory 
}) {
  const config = categoryConfig[categoryKey]
  const Icon = config.icon
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-400"
    if (score >= 60) return "bg-amber-400"
    return "bg-red-400"
  }

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{category.score}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress 
          value={category.score} 
          className="h-1.5"
          indicatorClassName={getProgressColor(category.score)}
        />
        
        {category.issues.length > 0 && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="issues" className="border-none">
              <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                {category.issues.length} issue{category.issues.length !== 1 ? 's' : ''} found
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {category.issues.map((issue) => {
                    const severityInfo = severityConfig[issue.severity]
                    const SeverityIcon = severityInfo.icon
                    
                    return (
                      <div 
                        key={issue.id} 
                        className="p-3 rounded-lg bg-background/50 border border-border/50"
                      >
                        <div className="flex items-start gap-2">
                          <SeverityIcon className={`h-4 w-4 mt-0.5 ${
                            issue.severity === 'critical' ? 'text-red-400' :
                            issue.severity === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                          }`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{issue.title}</span>
                              <Badge variant={severityInfo.badge} className="text-[10px] px-1.5 py-0">
                                {severityInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                            {issue.location && (
                              <p className="text-xs text-muted-foreground/70">
                                📍 {issue.location}
                              </p>
                            )}
                            <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/20">
                              <p className="text-xs text-primary flex items-start gap-1.5">
                                <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {category.issues.length === 0 && (
          <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            No issues found
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function AuditReport({ result }: AuditReportProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={result.overallScore} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Overall UX Score</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid gap-4">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => (
          <CategoryCard 
            key={key} 
            categoryKey={key} 
            category={result.categories[key]} 
          />
        ))}
      </div>

      {/* Top Recommendations */}
      {result.topRecommendations.length > 0 && (
        <Card className="bg-card/50 border-accent/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              Top Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {result.topRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground pt-0.5">{rec}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

