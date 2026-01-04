"use client"

import { useState, useCallback } from "react"
import { 
  Upload, 
  Scan, 
  Zap, 
  X, 
  ImageIcon,
  Loader2,
  Sparkles,
  Radio
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AuditReport, AuditResult } from "@/components/AuditReport"

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const clearImage = useCallback(() => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }, [])

  const analyzeImage = async () => {
    if (!image) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", image)

      const response = await fetch("/api/audit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Scan className="w-5 h-5 text-background" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    UX-Ray
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    AI-Powered Design Audit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Radio className="w-3 h-3 text-primary animate-pulse" />
                <span>Powered by Gemini Vision</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Upload */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Scan Your Interface
                </h2>
                <p className="text-muted-foreground">
                  Upload a screenshot and let our AI reveal hidden UX flaws
                </p>
              </div>

              {/* Upload Zone */}
              <Card 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isDragging 
                    ? "border-primary border-2 xray-glow" 
                    : "border-dashed border-2 hover:border-primary/50"
                }`}
              >
                {preview ? (
                  <div className="relative">
                    {/* Image Preview */}
                    <div className="relative aspect-video bg-black/50">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Scanning overlay */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="scan-overlay w-full h-20 animate-scan-line" />
                          </div>
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                          <p className="text-sm text-primary font-medium">Analyzing design...</p>
                          <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                        </div>
                      )}
                    </div>

                    {/* Clear button */}
                    {!isAnalyzing && (
                      <button
                        onClick={clearImage}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* File info */}
                    <div className="p-4 border-t border-border/50 bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{image?.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {image && (image.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="flex flex-col items-center justify-center p-12 cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium mb-1">
                      Drop your screenshot here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>PNG, JPG, WebP</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>Max 10MB</span>
                    </div>
                  </label>
                )}
              </Card>

              {/* Analyze Button */}
              {preview && !isAnalyzing && (
                <Button 
                  onClick={analyzeImage} 
                  size="lg" 
                  variant="glow"
                  className="w-full text-base font-semibold"
                >
                  <Zap className="w-5 h-5" />
                  Start X-Ray Analysis
                </Button>
              )}

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/10">
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              )}

              {/* Features */}
              {!preview && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🎯", title: "Accessibility", desc: "WCAG compliance check" },
                    { icon: "👁️", title: "Visual Hierarchy", desc: "Layout & spacing analysis" },
                    { icon: "🖱️", title: "Usability", desc: "Interaction patterns" },
                    { icon: "🎨", title: "Consistency", desc: "Design system alignment" },
                  ].map((feature) => (
                    <Card 
                      key={feature.title}
                      className="p-4 bg-card/30 border-border/30 hover:bg-card/50 transition-colors"
                    >
                      <span className="text-2xl mb-2 block">{feature.icon}</span>
                      <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analysis Report</h2>
                {result && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Scan Complete</span>
                  </div>
                )}
              </div>

              {result ? (
                <AuditReport result={result} />
              ) : (
                <Card className="flex flex-col items-center justify-center p-12 border-dashed bg-card/30 min-h-[400px]">
                  <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Scan className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No analysis yet
                  </p>
                  <p className="text-sm text-muted-foreground/70 text-center max-w-xs">
                    Upload a screenshot and click &quot;Start X-Ray Analysis&quot; to reveal UX insights
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Built for Hackathon 2026 🚀</p>
              <p>UX-Ray • AI-Powered Design Audits</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
