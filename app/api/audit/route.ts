import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const AUDIT_PROMPT = `You are an expert HCI (Human-Computer Interaction) researcher and UI/UX auditor with decades of experience. You have a sharp, critical eye for design flaws and accessibility issues.

Analyze this UI screenshot like you're conducting a professional UX audit. Be thorough, specific, and constructive. Look for issues that real users would encounter.

Return your analysis as a JSON object with this EXACT structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary of the UI's strengths and weaknesses>",
  "categories": {
    "accessibility": {
      "name": "Accessibility",
      "score": <number 0-100>,
      "issues": [
        {
          "id": "<unique-id>",
          "title": "<short issue title>",
          "description": "<detailed description of the problem>",
          "severity": "<critical|warning|info>",
          "location": "<where in the UI this occurs, if identifiable>",
          "suggestion": "<specific, actionable fix recommendation>"
        }
      ]
    },
    "visualHierarchy": {
      "name": "Visual Hierarchy",
      "score": <number 0-100>,
      "issues": [...]
    },
    "usability": {
      "name": "Usability", 
      "score": <number 0-100>,
      "issues": [...]
    },
    "consistency": {
      "name": "Consistency",
      "score": <number 0-100>,
      "issues": [...]
    }
  },
  "topRecommendations": [
    "<prioritized recommendation 1>",
    "<prioritized recommendation 2>",
    "<prioritized recommendation 3>"
  ]
}

Scoring Guidelines:
- 90-100: Excellent, minor polish needed
- 70-89: Good, some notable issues
- 50-69: Fair, significant improvements needed
- Below 50: Poor, major redesign recommended

Severity Guidelines:
- critical: Blocks users, violates accessibility standards (WCAG), or causes significant confusion
- warning: Creates friction or degrades experience but doesn't block users
- info: Minor polish items or best practice suggestions

Focus on:
1. Accessibility: Color contrast, text sizing, touch targets, screen reader compatibility, WCAG compliance
2. Visual Hierarchy: Information architecture, visual flow, spacing, typography scale, focal points
3. Usability: Clarity of actions, affordances, error prevention, learnability, efficiency
4. Consistency: Pattern adherence, spacing systems, color usage, component uniformity

Be specific about locations when possible (e.g., "the blue button in the top-right corner").
ONLY return valid JSON. No markdown, no code blocks, no explanations outside the JSON.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    
    // Determine mime type
    const mimeType = file.type || "image/png"

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    }

    // Generate content
    const result = await model.generateContent([AUDIT_PROMPT, imagePart])
    const response = await result.response
    const text = response.text()

    // Parse JSON from response (handle potential markdown code blocks)
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
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze image. Please check your API key and try again." },
      { status: 500 }
    )
  }
}

