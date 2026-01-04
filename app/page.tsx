"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  X, 
  ImageIcon,
  Scan,
  Sparkles,
  Skull
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AuditReport, AuditResult } from "@/components/AuditReport"
import { XRayOverlay } from "@/components/XRayOverlay"
import { ExportReport } from "@/components/ExportReport"

const LOADING_MESSAGES = [
  "Calibrating lens...",
  "Detecting contrast violations...",
  "Judging your font choices...",
  "Analyzing visual hierarchy...",
  "Counting accessibility sins...",
  "Measuring whitespace anxiety...",
  "Scanning for design crimes...",
  "Evaluating color harmony...",
  "Computing brutality level...",
  "Preparing diagnosis...",
]

function XRayScanner() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 overflow-hidden">
      {/* Scan line animation with framer-motion */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_30px_10px_rgba(0,255,136,0.4)]"
        initial={{ top: "0%" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Horizontal scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.02)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/60" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/60" />

      {/* Center content */}
      <motion.div 
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pulsing scanner icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Scan className="w-10 h-10 text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Status text */}
        <div className="font-mono text-sm space-y-3">
          <motion.p 
            className="text-primary font-bold"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            SCANNING IN PROGRESS
          </motion.p>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-muted-foreground h-5"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Compress image to reduce size for API
async function compressImage(file: File, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // Scale down if too large
        const maxDimension = 1200
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress with decreasing quality until under maxSizeKB
        let quality = 0.8
        let result = canvas.toDataURL('image/jpeg', quality)
        
        while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }
        
        resolve(result)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

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

  const scanUI = async () => {
    if (!image) return

    setIsScanning(true)
    setError(null)

    try {
      // Compress image to avoid 413 error (max ~500KB)
      const compressedImage = await compressImage(image, 500)

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: compressedImage,
          mimeType: "image/jpeg",
        }),
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
      setIsScanning(false)
    }
  }

  const resetAll = useCallback(() => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          className="pt-12 pb-6 px-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <Scan className="w-7 h-7 text-background" />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/50"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent">
                UX-Ray
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-2">
              Reveal the invisible flaws in your UI.
            </p>
            <p className="text-sm text-muted-foreground/60 font-mono">
              Powered by Gemini 3 flash • X-Ray vision for designers
            </p>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {!result ? (
                /* Upload Section */
                <motion.div 
                  key="upload"
                  className="max-w-2xl mx-auto space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Drop Zone */}
                  <Card 
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isDragging 
                        ? "border-primary border-2 shadow-lg shadow-primary/20" 
                        : "border-dashed border-2 border-border/50 hover:border-primary/50"
                    } ${preview ? "border-solid" : ""}`}
                  >
                    {preview ? (
                      <div className="relative">
                        {/* Image Preview */}
                        <div className="relative aspect-video bg-black/80">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          
                          {/* X-Ray Scanner overlay */}
                          {isScanning && <XRayScanner />}
                        </div>

                        {/* Clear button */}
                        {!isScanning && (
                          <button
                            onClick={clearImage}
                            className="absolute top-4 right-4 p-2.5 rounded-xl bg-background/90 backdrop-blur border border-border/50 hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                        {/* File info bar */}
                        <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <ImageIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{image?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {image && (image.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {isScanning ? "Scanning..." : "Ready"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className="flex flex-col items-center justify-center p-16 cursor-pointer group"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        
                        {/* Upload icon */}
                        <motion.div 
                          className="relative mb-6"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                            <Upload className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="absolute -inset-2 rounded-3xl border border-primary/20 group-hover:border-primary/40 transition-colors" />
                        </motion.div>

                        <p className="text-xl font-bold mb-2">
                          Drop your UI screenshot here
                        </p>
                        <p className="text-muted-foreground mb-6">
                          or click to browse files
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground/60 font-mono">
                          <span className="px-2 py-1 rounded bg-muted/30">PNG</span>
                          <span className="px-2 py-1 rounded bg-muted/30">JPG</span>
                          <span className="px-2 py-1 rounded bg-muted/30">WebP</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span>Max 10MB</span>
                        </div>
                      </label>
                    )}
                  </Card>

                  {/* Scan Button */}
                  {preview && !isScanning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button 
                        onClick={scanUI} 
                        size="lg" 
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                      >
                        <Scan className="w-6 h-6 mr-2" />
                        Scan UI
                      </Button>
                    </motion.div>
                  )}

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Card className="p-4 border-destructive/50 bg-destructive/10">
                          <div className="flex items-center gap-3">
                            <Skull className="w-5 h-5 text-destructive" />
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Features Preview */}
                  {!preview && (
                    <motion.div 
                      className="grid grid-cols-3 gap-4 mt-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[
                        { icon: "👁️", label: "Visual Hierarchy", desc: "Layout & flow" },
                        { icon: "♿", label: "Accessibility", desc: "WCAG checks" },
                        { icon: "🎨", label: "Consistency", desc: "Design patterns" },
                      ].map((feature, i) => (
                        <motion.div 
                          key={feature.label}
                          className="text-center p-4 rounded-xl bg-card/30 border border-border/30 hover:bg-card/50 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <span className="text-3xl block mb-2">{feature.icon}</span>
                          <p className="font-medium text-sm">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Results Section */
                <motion.div 
                  key="results"
                  className="space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Back button and actions */}
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      onClick={resetAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ← Scan another
                    </Button>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="flex items-center gap-2 text-sm text-primary font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Diagnosis complete
                      </motion.div>
                      {/* Export Button */}
                      <ExportReport 
                        result={result} 
                        imageUrl={preview!} 
                        reportRef={reportRef} 
                      />
                    </div>
                  </div>

                  {/* Exportable report container */}
                  <div ref={reportRef} className="bg-background">
                    {/* Two column layout - split view */}
                    <div className="grid lg:grid-cols-5 gap-8">
                      {/* Left: X-Ray Preview column */}
                      <motion.div 
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="sticky top-8">
                          {result.annotations && result.annotations.length > 0 ? (
                            <XRayOverlay 
                              imageUrl={preview!} 
                              annotations={result.annotations} 
                            />
                          ) : (
                            <Card className="overflow-hidden">
                              <div className="aspect-video bg-black/80">
                                <img
                                  src={preview!}
                                  alt="Analyzed UI"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="p-4 border-t border-border/50 bg-card/50">
                                <p className="text-xs text-muted-foreground font-mono">
                                  {image?.name}
                                </p>
                              </div>
                            </Card>
                          )}
                        </div>
                      </motion.div>

                      {/* Right: Results column */}
                      <motion.div 
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <AuditReport result={result} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 py-6 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground/60">
            <p className="font-mono">Built for Hacks for Hackers • MLH 🚀</p>
            <p>UX-Ray • AI-Powered Design X-Ray</p>
          </div>
      </footer>
      </div>
    </div>
  )
}
