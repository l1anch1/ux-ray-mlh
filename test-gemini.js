#!/usr/bin/env node

/**
 * Test script to verify GEMINI_API_KEY works correctly
 * Usage: node test-gemini.js
 * Or with custom key: GEMINI_API_KEY=your_key node test-gemini.js
 */

const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });

async function testGeminiAPI() {
  console.log("🔍 Testing Gemini API...\n");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY not found!");
    console.log("\nPlease set it in .env.local file:");
    console.log("GEMINI_API_KEY=your_api_key_here");
    process.exit(1);
  }

  console.log(`✅ API Key found: ${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`);
  console.log("");

  try {
    const ai = new GoogleGenAI({ apiKey });

    console.log("📡 Sending test request to Gemini...\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Say 'Hello! Gemini API is working!' in exactly those words." }],
        },
      ],
    });

    const text = response.text;

    console.log("✅ SUCCESS! Gemini responded:");
    console.log("─".repeat(40));
    console.log(text);
    console.log("─".repeat(40));
    console.log("\n🎉 Your GEMINI_API_KEY is working correctly!\n");

  } catch (error) {
    console.error("❌ ERROR: API call failed!\n");
    
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      console.error("🚫 Quota exceeded - Your free tier limit has been reached.");
      console.log("   Wait a few minutes or create a new API key.");
    } else if (error.message?.includes("401") || error.message?.includes("403")) {
      console.error("🔐 Authentication failed - Invalid API key.");
      console.log("   Please check your GEMINI_API_KEY in .env.local");
    } else if (error.message?.includes("fetch failed") || error.message?.includes("ECONNREFUSED")) {
      console.error("🌐 Network error - Cannot connect to Gemini API.");
      console.log("   Check your internet connection or VPN.");
    } else {
      console.error("Error details:", error.message);
    }
    
    process.exit(1);
  }
}

testGeminiAPI();

