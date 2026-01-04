"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Download, Share2, Check, Loader2, Image as ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AuditResult } from "@/components/AuditReport"
import { Annotation } from "@/components/XRayOverlay"

interface ExportReportProps {
  result: AuditResult & { annotations?: Annotation[] }
  imageUrl: string
  reportRef: React.RefObject<HTMLDivElement>
}

export function ExportReport({ result, imageUrl: _imageUrl, reportRef }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const captureReport = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    // Dynamic import of html2canvas to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default

    if (!reportRef.current) return null

    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    return canvas
  }, [reportRef])

  const exportAsImage = useCallback(async () => {
    setIsExporting(true)
    try {
      const canvas = await captureReport()
      if (!canvas) return

      const link = document.createElement("a")
      link.download = `ux-ray-report-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }, [captureReport])

  const exportAsJSON = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      tool: "UX-Ray",
      result: result,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.download = `ux-ray-report-${Date.now()}.json`
    link.href = URL.createObjectURL(blob)
    link.click()

    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 2000)
  }, [result])

  const copyToClipboard = useCallback(async () => {
    setIsExporting(true)
    try {
      const canvas = await captureReport()
      if (!canvas) return

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ])
          setExportSuccess(true)
          setTimeout(() => setExportSuccess(false), 2000)
        }
      })
    } catch (error) {
      console.error("Copy failed:", error)
      // Fallback: copy text summary
      const summary = `UX-Ray Report\nScore: ${result.score}/100\nVerdict: ${result.summary}\n\nCritical Issues:\n${result.criticalIssues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}`
      await navigator.clipboard.writeText(summary)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } finally {
      setIsExporting(false)
    }
  }, [captureReport, result])

  const shareReport = useCallback(async () => {
    if (!navigator.share) {
      // Fallback to copy
      await copyToClipboard()
      return
    }

    try {
      const canvas = await captureReport()
      if (!canvas) return

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "ux-ray-report.png", { type: "image/png" })
          await navigator.share({
            title: "UX-Ray Report",
            text: `UX-Ray Analysis: Score ${result.score}/100 - "${result.summary}"`,
            files: [file],
          })
        }
      })
    } catch (error) {
      console.error("Share failed:", error)
    }
  }, [captureReport, copyToClipboard, result])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : exportSuccess ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exportSuccess ? "Exported!" : "Export Report"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsImage} className="gap-2 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          Save as Image (PNG)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Save as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareReport} className="gap-2 cursor-pointer">
          <Share2 className="w-4 h-4" />
          Share...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact summary card for export
export function ExportSummaryCard({ result }: { result: AuditResult }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-background via-background to-muted/20 border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <svg className="w-5 h-5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg">UX-Ray</h3>
          <p className="text-xs text-muted-foreground">AI Design Analysis</p>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-5xl font-black ${getScoreColor(result.score)}`}>
          {result.score}
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="block">/100</span>
          <span className="block font-medium">
            {result.score >= 80 ? "Great" : result.score >= 60 ? "Needs Work" : "Critical"}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground italic mb-4">
        &ldquo;{result.summary}&rdquo;
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>{result.criticalIssues.length} critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>{result.quickFixes.length} fixes</span>
        </div>
      </div>
    </div>
  )
}

