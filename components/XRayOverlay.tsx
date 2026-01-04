"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, AlertCircle, Info, X, ZoomIn, ZoomOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface Annotation {
  id: number
  x: number
  y: number
  width: number
  height: number
  severity: "critical" | "warning" | "info"
  label: string
  description: string
}

interface XRayOverlayProps {
  imageUrl: string
  annotations: Annotation[]
  className?: string
}

const severityConfig = {
  critical: {
    color: "border-red-500",
    bg: "bg-red-500/20",
    hoverBg: "hover:bg-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500",
    icon: AlertCircle,
    pulse: "animate-pulse",
  },
  warning: {
    color: "border-amber-500",
    bg: "bg-amber-500/20",
    hoverBg: "hover:bg-amber-500/30",
    text: "text-amber-400",
    badge: "bg-amber-500",
    icon: AlertTriangle,
    pulse: "",
  },
  info: {
    color: "border-blue-500",
    bg: "bg-blue-500/20",
    hoverBg: "hover:bg-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500",
    icon: Info,
    pulse: "",
  },
}

export function XRayOverlay({ imageUrl, annotations, className = "" }: XRayOverlayProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [scale, setScale] = useState(1)

  const handleAnnotationClick = useCallback((id: number) => {
    setActiveAnnotation(activeAnnotation === id ? null : id)
  }, [activeAnnotation])

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black/90 ${className}`}>
      {/* Control bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:bg-background transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:bg-background transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`px-3 py-2 rounded-lg backdrop-blur border border-border/50 transition-colors text-xs font-medium ${
            showAnnotations 
              ? "bg-primary/20 text-primary border-primary/50" 
              : "bg-background/80 text-muted-foreground hover:bg-background"
          }`}
        >
          {showAnnotations ? "Hide X-Ray" : "Show X-Ray"}
        </button>
      </div>

      {/* Image container with zoom */}
      <div 
        className="relative aspect-video overflow-auto"
        style={{ maxHeight: "70vh" }}
      >
        <div 
          className="relative transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${scale})`, minWidth: "100%", minHeight: "100%" }}
        >
          {/* Base image */}
          <img
            src={imageUrl}
            alt="UI Screenshot with annotations"
            className="w-full h-full object-contain"
          />

          {/* X-Ray scan effect overlay */}
          <AnimatePresence>
            {showAnnotations && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Scan lines effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.02)_50%)] bg-[length:100%_4px]" />
                
                {/* Vignette effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Annotation boxes */}
          <AnimatePresence>
            {showAnnotations && annotations.map((annotation, index) => {
              const config = severityConfig[annotation.severity]
              const Icon = config.icon
              const isActive = activeAnnotation === annotation.id

              return (
                <motion.div
                  key={annotation.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className={`absolute cursor-pointer transition-all duration-200 ${config.color} ${config.bg} ${config.hoverBg} border-2 rounded-lg ${config.pulse}`}
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    width: `${annotation.width}%`,
                    height: `${annotation.height}%`,
                    boxShadow: isActive 
                      ? `0 0 20px ${annotation.severity === 'critical' ? 'rgba(239,68,68,0.5)' : annotation.severity === 'warning' ? 'rgba(245,158,11,0.5)' : 'rgba(59,130,246,0.5)'}` 
                      : 'none',
                  }}
                  onClick={() => handleAnnotationClick(annotation.id)}
                >
                  {/* Number badge */}
                  <div 
                    className={`absolute -top-3 -left-3 w-6 h-6 rounded-full ${config.badge} text-white text-xs font-bold flex items-center justify-center shadow-lg z-10`}
                  >
                    {annotation.id}
                  </div>

                  {/* Icon indicator */}
                  <div className={`absolute -top-3 -right-3 p-1 rounded-full ${config.badge} text-white shadow-lg z-10`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Tooltip on hover/click */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute left-0 top-full mt-2 z-50 w-64"
                        style={{ 
                          transform: annotation.x > 60 ? 'translateX(-50%)' : 'translateX(0)',
                        }}
                      >
                        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-2xl">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${config.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={annotation.severity === 'critical' ? 'critical' : annotation.severity === 'warning' ? 'warning' : 'default'}
                                  className="text-[10px] uppercase tracking-wider"
                                >
                                  {annotation.severity}
                                </Badge>
                              </div>
                              <p className={`font-bold text-sm ${config.text} mb-1`}>
                                {annotation.label}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {annotation.description}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveAnnotation(null)
                              }}
                              className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Annotations legend */}
      <AnimatePresence>
        {showAnnotations && annotations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 border-t border-border/50 bg-card/80 backdrop-blur"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-muted-foreground">Issues Found:</span>
              <div className="flex items-center gap-3">
                {Object.entries(
                  annotations.reduce((acc, a) => {
                    acc[a.severity] = (acc[a.severity] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([severity, count]) => (
                  <div key={severity} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${severityConfig[severity as keyof typeof severityConfig].badge}`} />
                    <span className="text-xs">{count} {severity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick list */}
            <div className="flex flex-wrap gap-2">
              {annotations.map((annotation) => {
                const config = severityConfig[annotation.severity]
                return (
                  <button
                    key={annotation.id}
                    onClick={() => handleAnnotationClick(annotation.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeAnnotation === annotation.id
                        ? `${config.bg} ${config.text} border ${config.color}`
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="font-bold mr-1">#{annotation.id}</span>
                    {annotation.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

