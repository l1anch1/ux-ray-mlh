# 🔬 UX-Ray

> X-Ray vision into bad UI design — AI-powered UX audit tool

Upload a screenshot of your app, and Gemini Vision scans it like an X-Ray to reveal hidden UX/UI flaws.

## ✨ Features

- 📸 **Screenshot Upload** — Drag & drop or click to upload
- 🤖 **AI Analysis** — Powered by Google Gemini 2.0 Flash
- 📊 **Detailed Scores** — Visual Hierarchy, Accessibility, Consistency
- 🔴 **Critical Issues** — Immediate problems to fix
- 💡 **Quick Fixes** — Low-effort, high-impact improvements

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API Key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **AI**: Google Gemini 3 Pro Preview

## 📁 Project Structure

```
├── app/
│   ├── api/audit/route.ts    # Gemini Vision API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── AuditReport.tsx       # Results display component
│   └── ui/                   # Shadcn UI components
└── lib/
    └── utils.ts              # Utility functions
```

## 📝 License

MIT — Built for **Hacks for Hackers** hosted by MLH 🚀
