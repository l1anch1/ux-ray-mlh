"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { 
  Upload, 
  X, 
  ImageIcon,
  Scan,
  Sparkles,
  Skull,
  Zap,
  Eye,
  Shield,
  Palette,
  ArrowRight,
  ChevronDown
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

// Landing Page Component
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const features = [
    {
      icon: Eye,
      title: "Visual Hierarchy Analysis",
      description: "Identify layout issues, flow problems, and visual weight imbalances that confuse users.",
      gradient: "from-emerald-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Accessibility Audit",
      description: "WCAG compliance checks including contrast ratios, touch targets, and screen reader compatibility.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: Palette,
      title: "Design Consistency",
      description: "Spot inconsistent spacing, typography, and color usage that breaks design systems.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive analysis in seconds powered by advanced AI vision models.",
      gradient: "from-amber-500 to-orange-500"
    }
  ]

  const steps = [
    { number: "01", title: "Upload", description: "Drop your UI screenshot or design mockup" },
    { number: "02", title: "Scan", description: "AI analyzes every pixel for UX issues" },
    { number: "03", title: "Review", description: "Get annotated results with actionable fixes" },
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,255,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,0,255,0.05),transparent_40%)]" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
              <Scan className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-bold tracking-tight">UX-Ray</span>
          </div>
          <Button 
            onClick={onGetStarted}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm"
          >
            Launch App
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ opacity, scale }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block text-foreground">See Through</span>
            <span className="block bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Bad Design
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload any UI screenshot and let AI reveal hidden usability flaws, 
            accessibility issues, and design inconsistencies in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25 group"
            >
              Start Scanning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-border/50 hover:bg-card/50"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm p-1">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-card to-background">
                {/* Mock UI preview */}
                <div className="aspect-video relative bg-black/40 flex items-center justify-center">
                  <div className="absolute inset-0 grid-pattern opacity-10" />
                  
                  {/* Animated scan line */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Mock annotations */}
                  <motion.div 
                    className="absolute top-[20%] left-[15%] w-32 h-8 border-2 border-red-500/60 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div 
                    className="absolute top-[45%] right-[20%] w-24 h-24 border-2 border-amber-500/60 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  />
                  <motion.div 
                    className="absolute bottom-[25%] left-[30%] w-40 h-6 border-2 border-primary/60 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                  />
                  
                  {/* Center content */}
                  <div className="relative z-10 text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Scan className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">Drop your screenshot here to begin</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl -z-10" />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              X-Ray Vision for
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Design</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI doesn&apos;t just look at your UI — it sees through it to find problems humans miss.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group p-8 bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Three Steps to
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Better UX</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              From upload to insights in under 30 seconds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  <span className="text-4xl font-black text-primary">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { value: "50+", label: "UX Issues Detected" },
              { value: "<30s", label: "Analysis Time" },
              { value: "WCAG", label: "Compliance Checks" },
              { value: "AI", label: "Powered Analysis" },
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/10" />
            <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Ready to See the
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Invisible?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                Stop guessing. Start knowing. Upload your first screenshot and discover what&apos;s really wrong with your design.
              </p>
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="h-16 px-10 text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-xl shadow-primary/30 group"
              >
                <Scan className="w-6 h-6 mr-3" />
                Start Free Analysis
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/30 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
              <Scan className="w-4 h-4 text-background" />
            </div>
            <span className="font-bold">UX-Ray</span>
            <span className="text-muted-foreground/60 text-sm">• AI-Powered Design Analysis</span>
          </div>
          <p className="text-sm text-muted-foreground/60 font-mono">
            Built for Hacks for Hackers • MLH 🚀
          </p>
        </div>
      </footer>
    </div>
  )
}

// Main App Component
function AppInterface() {
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
          className="pt-8 pb-6 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <Scan className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold tracking-tight">UX-Ray</span>
            </div>
            <p className="text-sm text-muted-foreground/60 font-mono hidden sm:block">
              AI-Powered Design X-Ray
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
                  {/* Title */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                      <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent">
                        Scan Your UI
                      </span>
                    </h1>
                    <p className="text-muted-foreground">
                      Upload a screenshot to reveal hidden design flaws
                    </p>
                  </div>

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

export default function Home() {
  const [showApp, setShowApp] = useState(false)

  return (
    <AnimatePresence mode="wait">
      {!showApp ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage onGetStarted={() => setShowApp(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AppInterface />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
