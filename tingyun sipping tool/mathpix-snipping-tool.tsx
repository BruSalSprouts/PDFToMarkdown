"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Square,
  Move,
  Pencil,
  FileText,
  List,
  FileDown,
  Trash2,
  Settings,
  Minus,
  SquareIcon,
  X,
  ChevronLeft,
  Grid,
  Undo,
  Redo,
  PenTool,
  Link,
  Upload,
  Download,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

// Define the available models
const PDF_MODELS = [
  {
    id: "nougat",
    name: "Nougat",
    description: "Meta AI's Nougat model for academic PDF parsing",
    strengths: ["Academic papers", "Mathematical formulas", "Tables", "Figures"],
    processingTime: "Medium",
  },
  {
    id: "gpt4v",
    name: "GPT-4 Vision",
    description: "OpenAI's GPT-4 with vision capabilities",
    strengths: ["General documents", "Context understanding", "Natural language"],
    processingTime: "Slow",
  },
  {
    id: "layoutlm",
    name: "LayoutLM",
    description: "Microsoft's document understanding model",
    strengths: ["Document layout", "Tables", "Forms"],
    processingTime: "Fast",
  },
  {
    id: "donut",
    name: "Donut",
    description: "Document understanding transformer model",
    strengths: ["Structured documents", "Fast processing", "Low resource usage"],
    processingTime: "Very Fast",
  },
]

// Model-specific processing settings
const MODEL_SETTINGS = {
  nougat: {
    defaultQuality: 80,
    supportsEquations: true,
    supportsTableDetection: true,
    processingSteps: [
      "Document analysis",
      "Layout detection",
      "OCR processing",
      "Math formula recognition",
      "Markdown conversion",
    ],
  },
  gpt4v: {
    defaultQuality: 90,
    supportsEquations: true,
    supportsTableDetection: true,
    processingSteps: [
      "Image analysis",
      "Content extraction",
      "Context understanding",
      "Markdown generation",
      "Post-processing",
    ],
  },
  layoutlm: {
    defaultQuality: 75,
    supportsEquations: false,
    supportsTableDetection: true,
    processingSteps: ["Layout analysis", "Text extraction", "Structure detection", "Markdown formatting"],
  },
  donut: {
    defaultQuality: 70,
    supportsEquations: false,
    supportsTableDetection: false,
    processingSteps: ["Document parsing", "Text recognition", "Markdown generation"],
  },
}

export default function TingyunSnippingTool() {
  const [activeTab, setActiveTab] = useState("latex")
  const [isHandwritingMode, setIsHandwritingMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("nougat")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [markdownResult, setMarkdownResult] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [qualityLevel, setQualityLevel] = useState(
    MODEL_SETTINGS[selectedModel as keyof typeof MODEL_SETTINGS].defaultQuality,
  )
  const [preserveTables, setPreserveTables] = useState(true)
  const [preserveEquations, setPreserveEquations] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update quality level when model changes
  useEffect(() => {
    setQualityLevel(MODEL_SETTINGS[selectedModel as keyof typeof MODEL_SETTINGS].defaultQuality)
  }, [selectedModel])

  const handlePenClick = () => {
    setIsHandwritingMode(true)
  }

  const handleBackClick = () => {
    setIsHandwritingMode(false)
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setPdfFile(file)
      } else {
        alert("Please upload a PDF file")
      }
    }
  }

  const processWithNougat = async (file: File) => {
    const steps = MODEL_SETTINGS.nougat.processingSteps
    const totalSteps = steps.length

    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(steps[i])
      setConversionProgress(Math.floor(((i + 0.5) / totalSteps) * 100))
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    // Generate academic paper with math formulas
    return `# ${file.name.replace(".pdf", "")}\n\n## Abstract\n\nThis paper presents a novel approach to mathematical formula recognition using deep learning techniques. We demonstrate that our method achieves state-of-the-art performance on standard benchmarks.\n\n## Introduction\n\nMathematical formula recognition has been a challenging problem in document analysis. Traditional approaches relied on hand-crafted features, but recent advances in deep learning have opened new possibilities.\n\n## Method\n\nWe propose a transformer-based architecture that processes both the visual and structural aspects of mathematical notation. The model can be expressed as:\n\n$$f(x) = \\sum_{i=1}^{n} w_i \\phi_i(x) + b$$\n\nWhere $\\phi_i(x)$ represents the feature extractors.\n\n## Experiments\n\nWe conducted experiments on the standard benchmark datasets. Table 1 shows our results compared to previous methods.\n\n| Method | Accuracy | F1 Score | Processing Time |\n|--------|----------|----------|----------------|\n| Ours   | 94.2%    | 92.8%    | 0.3s           |\n| Method A | 91.5%   | 90.2%    | 0.5s           |\n| Method B | 89.7%   | 88.5%    | 0.4s           |\n\nAs shown in the table, our method outperforms previous approaches in both accuracy and speed.\n\n## Conclusion\n\nWe have presented a novel approach to mathematical formula recognition that achieves state-of-the-art performance. Future work will focus on extending the model to handle more complex notations and improving efficiency.`
  }

  const processWithGPT4V = async (file: File) => {
    const steps = MODEL_SETTINGS.gpt4v.processingSteps
    const totalSteps = steps.length

    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(steps[i])
      setConversionProgress(Math.floor(((i + 0.5) / totalSteps) * 100))
      await new Promise((resolve) => setTimeout(resolve, 1000)) // GPT-4V is slower
    }

    // Generate more descriptive, context-aware content
    return `# ${file.name.replace(".pdf", "")}\n\nThis document appears to be a research paper on mathematical formula recognition. The content is structured with several sections including an abstract, introduction, methodology, and results.\n\n## Key Findings\n\n- Novel approach using transformer architecture
- State-of-the-art results on benchmark datasets
- Improved recognition of complex mathematical notation\n\n## Document Structure\n\nThe paper follows a standard academic structure with the following sections:\n\n1. **Abstract** - Summarizes the paper's contributions
2. **Introduction** - Provides background and motivation
3. **Related Work** - Reviews previous approaches
4. **Methodology** - Describes the proposed approach
5. **Experiments** - Presents evaluation results
6. **Conclusion** - Summarizes findings and future work\n\n## Equations\n\nThe paper contains several equations, including:\n\n$$\\nabla \\times \\vec{B} = \\mu_0 \\vec{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$$\n\nAnd:\n\n$$\\int_{a}^{b} f(x) dx = F(b) - F(a)$$\n\n## Tables\n\nThe document includes a results table comparing different methods:\n\n| Method | Precision | Recall | F1 Score |\n|--------|-----------|--------|----------|\n| Proposed | 95.2% | 94.8% | 95.0% |\n| Baseline 1 | 92.1% | 91.5% | 91.8% |\n| Baseline 2 | 90.3% | 89.7% | 90.0% |`
  }

  const processWithLayoutLM = async (file: File) => {
    const steps = MODEL_SETTINGS.layoutlm.processingSteps
    const totalSteps = steps.length

    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(steps[i])
      setConversionProgress(Math.floor(((i + 0.5) / totalSteps) * 100))
      await new Promise((resolve) => setTimeout(resolve, 600)) // LayoutLM is faster
    }

    // Focus on document structure and tables
    return `# ${file.name.replace(".pdf", "")}\n\n## Document Structure\n\nThis document contains multiple sections with mathematical content. The layout includes a title, abstract, and several numbered sections.\n\n## Content Sections\n\n1. Introduction\n2. Related Work\n3. Methodology\n4. Experiments\n5. Results\n6. Conclusion\n\n## Tables\n\n### Table 1: Performance Comparison\n\n| Method | Accuracy | Speed | Memory Usage |\n|--------|----------|-------|---------------|\n| Method 1 | 92.5% | Fast | Medium |\n| Method 2 | 94.1% | Medium | Low |\n| Method 3 | 89.7% | Slow | High |\n| Method 4 | 91.3% | Fast | High |\n\n### Table 2: Dataset Statistics\n\n| Dataset | Samples | Classes | Resolution |\n|---------|---------|---------|------------|\n| Dataset A | 10,000 | 10 | 300 DPI |\n| Dataset B | 25,000 | 15 | 600 DPI |\n| Dataset C | 5,000 | 5 | 150 DPI |`
  }

  const processWithDonut = async (file: File) => {
    const steps = MODEL_SETTINGS.donut.processingSteps
    const totalSteps = steps.length

    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(steps[i])
      setConversionProgress(Math.floor(((i + 0.5) / totalSteps) * 100))
      await new Promise((resolve) => setTimeout(resolve, 400)) // Donut is very fast
    }

    // Simple, fast conversion with basic structure
    return `# ${file.name.replace(".pdf", "")}\n\n## Content Summary\n\nThis document appears to be a research paper related to mathematical formula recognition.\n\n## Extracted Text\n\n### Introduction\n\nMathematical formula recognition is an important task in document analysis. This paper proposes a new method for recognizing mathematical formulas in documents.\n\n### Methodology\n\nThe proposed method uses a neural network to recognize mathematical formulas. The network is trained on a large dataset of mathematical formulas.\n\n### Results\n\nThe proposed method achieves high accuracy on the test dataset. The accuracy is higher than previous methods.\n\n### Conclusion\n\nThe proposed method is effective for mathematical formula recognition. Future work will focus on improving the method further.`
  }

  const handleConvertPdf = async () => {
    if (!pdfFile) return

    setIsConverting(true)
    setConversionProgress(0)
    setShowResult(false)
    setCurrentStep("Initializing...")

    try {
      let result = ""

      // Process with selected model
      switch (selectedModel) {
        case "nougat":
          result = await processWithNougat(pdfFile)
          break
        case "gpt4v":
          result = await processWithGPT4V(pdfFile)
          break
        case "layoutlm":
          result = await processWithLayoutLM(pdfFile)
          break
        case "donut":
          result = await processWithDonut(pdfFile)
          break
        default:
          result = await processWithNougat(pdfFile)
      }

      // Apply quality settings
      if (qualityLevel < 50) {
        // Simulate lower quality by introducing errors
        result = result.replace(/\b(\w{7,})\b/g, (match) => {
          const shouldReplace = Math.random() < 0.3
          return shouldReplace ? match.slice(0, -1) + "?" : match
        })
      }

      // Handle table preservation setting
      if (!preserveTables && result.includes("| ")) {
        result = result.replace(/\n\|[^\n]+\|[^\n]+\n\|[^\n]+\|/g, "\n[Table content removed]")
      }

      // Handle equation preservation setting
      if (!preserveEquations && result.includes("$$")) {
        result = result.replace(/\$\$[^$]+\$\$/g, "[Equation removed]")
        result = result.replace(/\$[^$]+\$/g, "[Inline equation removed]")
      }

      setMarkdownResult(result)
      setIsConverting(false)
      setShowResult(true)
    } catch (error) {
      console.error("Conversion error:", error)
      setIsConverting(false)
      alert("Error converting PDF. Please try again.")
    }
  }

  const handleDownloadMarkdown = () => {
    if (!markdownResult) return

    const blob = new Blob([markdownResult], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pdfFile?.name.replace(".pdf", "")}.md` || "converted.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isHandwritingMode) {
    return (
      <div className="flex flex-col h-screen w-full border border-gray-300 bg-white">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
              T
            </div>
            <span className="text-sm text-gray-700">Tingyun Snipping Tool - Snip Create</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <Minus size={16} />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <SquareIcon size={16} />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Handwriting toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackClick}>
            <ChevronLeft size={18} />
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Grid size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-500">
              <PenTool size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link size={18} />
            </Button>
          </div>
        </div>

        {/* Handwriting content area */}
        <div className="flex-1 flex items-center justify-center bg-white w-full">
          <p className="text-gray-400">Handwrite your formula here.</p>
        </div>

        {/* Scan button */}
        <div className="flex justify-center p-4">
          <Button className="px-12 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md">Scan</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full border border-gray-300 bg-white">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
          <span className="text-sm text-gray-700">Tingyun Snipping Tool - Snip Create</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Minus size={16} />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <SquareIcon size={16} />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Square size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Move size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePenClick}>
            <Pencil size={18} />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                  <FileText size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload PDF for conversion</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <List size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileDown size={18} />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger
              value="markdown"
              className={`px-4 ${activeTab === "markdown" ? "bg-white text-black" : "bg-gray-100 text-gray-700"}`}
            >
              MARKDOWN
            </TabsTrigger>
            <TabsTrigger
              value="latex"
              className={`px-4 ${activeTab === "latex" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              LATEX
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSettingsClick}>
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 bg-white border border-gray-200 mx-4 my-2 rounded-md overflow-auto">
        {pdfFile && !showResult && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="flex items-center gap-2 text-purple-600">
              <FileText size={24} />
              <span className="font-medium">{pdfFile.name}</span>
            </div>

            {isConverting ? (
              <div className="w-full max-w-lg">
                <Progress value={conversionProgress} className="h-2 mb-2" />
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {currentStep} ({conversionProgress}%)
                  </span>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Using {PDF_MODELS.find((m) => m.id === selectedModel)?.name} model
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Model: {PDF_MODELS.find((m) => m.id === selectedModel)?.name}</span>
                  <span>•</span>
                  <span>Quality: {qualityLevel}%</span>
                </div>
                <Button onClick={handleConvertPdf} className="bg-purple-500 hover:bg-purple-600 text-white">
                  Convert to Markdown
                </Button>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Converted Markdown</h3>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                  {PDF_MODELS.find((m) => m.id === selectedModel)?.name}
                </span>
              </div>
              <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={handleDownloadMarkdown}>
                <Download size={14} />
                Download
              </Button>
            </div>
            <Textarea
              value={markdownResult}
              onChange={(e) => setMarkdownResult(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        )}

        {!pdfFile && !showResult && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="p-6 border-2 border-dashed rounded-lg border-gray-300 flex flex-col items-center gap-2 max-w-lg mx-auto">
              <Upload size={32} className="text-gray-400" />
              <p className="text-gray-500">Click the document icon in the toolbar to upload a PDF</p>
              <p className="text-xs text-gray-400">Supported models: Nougat, GPT-4V, LayoutLM, Donut</p>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-center p-4">
        <Button
          className="px-12 py-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-md"
          disabled={isConverting}
        >
          Save
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Configure your PDF to Markdown conversion settings</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">PDF to Markdown Model</h3>
              <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                {PDF_MODELS.map((model) => (
                  <div key={model.id} className="flex items-start space-x-2 mb-3">
                    <RadioGroupItem value={model.id} id={model.id} />
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={model.id} className="font-medium">
                          {model.name}
                        </Label>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {model.processingTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{model.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.strengths.map((strength, index) => (
                          <span key={index} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Quality Level</h3>
                <span className="text-sm text-gray-500">{qualityLevel}%</span>
              </div>
              <Slider
                value={[qualityLevel]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setQualityLevel(value[0])}
                className="mb-4"
              />
              <p className="text-xs text-gray-500">
                Higher quality provides better results but may take longer to process
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Content Preservation</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preserveTables"
                  checked={preserveTables}
                  onChange={(e) => setPreserveTables(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="preserveTables">Preserve tables</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preserveEquations"
                  checked={preserveEquations}
                  onChange={(e) => setPreserveEquations(e.target.checked)}
                  disabled={!MODEL_SETTINGS[selectedModel as keyof typeof MODEL_SETTINGS].supportsEquations}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="preserveEquations">
                  Preserve equations
                  {!MODEL_SETTINGS[selectedModel as keyof typeof MODEL_SETTINGS].supportsEquations && (
                    <span className="text-xs text-gray-500 ml-2">(Not supported by this model)</span>
                  )}
                </Label>
              </div>
            </div>

            <Alert className="mt-4 bg-purple-50 text-purple-800 border-purple-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The Nougat model is recommended for academic papers with mathematical content.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsSettingsOpen(false)}
              className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Check size={16} />
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
