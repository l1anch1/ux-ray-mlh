import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a Senior Product Designer and HCI Researcher. Analyze the uploaded UI screenshot for a Hackathon project. Critique it ruthlessly but constructively.

IMPORTANT: You MUST identify specific problem areas in the image and provide their coordinates as percentages (0-100) of the image dimensions.

Return ONLY valid JSON with this structure:
{
  "score": number (0-100),
  "summary": "One sentence savage summary",
  "categories": {
    "visualHierarchy": { "score": number, "comment": string },
    "accessibility": { "score": number, "comment": string },
    "consistency": { "score": number, "comment": string }
  },
  "criticalIssues": ["string", "string"],
  "quickFixes": ["string", "string"],
  "annotations": [
    {
      "id": 1,
      "x": number (0-100, percentage from left),
      "y": number (0-100, percentage from top),
      "width": number (0-100, percentage of image width),
      "height": number (0-100, percentage of image height),
      "severity": "critical" | "warning" | "info",
      "label": "Short label (2-4 words)",
      "description": "Brief description of the issue"
    }
  ]
}

For annotations:
- Identify 3-6 specific problem areas in the UI
- Use "critical" for severe issues (accessibility, contrast), "warning" for moderate issues, "info" for suggestions
- Coordinates are percentages: x=0 is left edge, y=0 is top edge, x=100 is right edge, y=100 is bottom edge
- Be precise with the bounding box to highlight the exact problem area`

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to .env.local" },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const body = await request.json()
    const { image, mimeType } = body as { image: string; mimeType: string }

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = image.includes(",") ? image.split(",")[1] : image

    // Generate content using the new SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: mimeType || "image/png",
                data: base64Data,
              },
            },
          ],
        },
      ],
    })

    // Get response text
    const text = response.text ?? ""
    
    if (!text) {
      return NextResponse.json(
        { error: "Empty response from AI. Please try again." },
        { status: 500 }
      )
    }

    // Clean up response if wrapped in markdown code blocks
    let jsonText = text
    if (text.includes("```json")) {
      jsonText = text.split("```json")[1].split("```")[0]
    } else if (text.includes("```")) {
      jsonText = text.split("```")[1].split("```")[0]
    }

    const auditResult = JSON.parse(jsonText.trim())

    return NextResponse.json(auditResult)
  } catch (error) {
    console.error("Audit error:", error)

    // Log full error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error message:", errorMessage)

    // More specific error messages
    if (error instanceof Error) {
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please wait a moment and try again, or use a new API key." },
          { status: 429 }
        )
      }
      if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ETIMEDOUT")) {
        return NextResponse.json(
          { error: "Cannot connect to Gemini API. Please check your network/VPN connection." },
          { status: 500 }
        )
      }
      if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your GEMINI_API_KEY in .env.local" },
          { status: 401 }
        )
      }
      if (errorMessage.includes("404") || errorMessage.includes("not found") || errorMessage.includes("NOT_FOUND")) {
        return NextResponse.json(
          { error: "Model not found. Try using 'gemini-2.0-flash' instead." },
          { status: 404 }
        )
      }
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Analysis failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
