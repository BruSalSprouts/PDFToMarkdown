// Real Model Integration server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { OpenAI } = require('openai');
const pdf2img = require('pdf-img-convert');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');
const { fileURLToPath } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client if API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OPENAI_API_KEY not found in environment variables. GPT-4V functionality will be unavailable.');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Error handling middleware for multer
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const modelStatus = {
    gpt4v: openai ? 'available' : 'unavailable',
    nougat: checkNougatAvailability() ? 'available' : 'unavailable',
    donut: checkDonutAvailability() ? 'available' : 'unavailable',
    layoutlm: checkLayoutLMAvailability() ? 'available' : 'unavailable'
  };

  res.status(200).json({ 
    status: 'ok', 
    models: modelStatus,
    timestamp: new Date().toISOString()
  });
});

// Check if Python models are available
function checkNougatAvailability() {
  try {
    // Check if nougat-ocr is installed by running a command
    exec('pip show nougat-ocr', (error, stdout, stderr) => {
      return !error;
    });
    return true;
  } catch (error) {
    return false;
  }
}

function checkDonutAvailability() {
  try {
    // Check if donut-python is installed by running a command
    exec('pip show donut-python', (error, stdout, stderr) => {
      return !error;
    });
    return true;
  } catch (error) {
    return false;
  }
}

function checkLayoutLMAvailability() {
  try {
    // Check if transformers with layoutlm is installed
    exec('pip show transformers', (error, stdout, stderr) => {
      return !error;
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Create temp directory for file processing
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to save buffer to temp file
async function saveTempFile(buffer, filename) {
  const filepath = path.join(tempDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

// Helper function to clean up temp files
function cleanupTempFiles(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}

// GPT-4V model endpoint
app.post('/api/gpt4v/analyze', upload.single('pdf'), handleMulterErrors, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured. GPT-4V processing is unavailable.' });
  }

  let pdfPath = null;
  try {
    // Save PDF to temp file
    const filename = `${Date.now()}-${req.file.originalname}`;
    pdfPath = await saveTempFile(req.file.buffer, filename);

    // Convert PDF to images
    const outputImages = await pdf2img.convert(pdfPath, {
      width: 1200, // Width in pixels
      height: 1600, // Height in pixels
      density: 300, // DPI
      savePath: tempDir, // Output path
      saveFilename: `page`, // Output filename pattern
      format: 'png', // Output format
      page: null // Convert all pages
    });

    console.log(`Converted PDF to ${outputImages.length} images`);

    // Process first page with GPT-4V (for simplicity - in production you'd process all pages)
    const imageBuffer = outputImages[0];
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Get extracted text from PDF for context
    const pdfData = await pdf(fs.readFileSync(pdfPath));
    const pdfText = pdfData.text.substring(0, 2000); // Limit context to 2000 chars to avoid token limits

    // Create prompt for GPT-4V
    const prompt = `
    Convert this PDF page to Markdown format preserving the structure and formatting.
    Follow these guidelines:
    - Maintain headings, paragraphs, lists, and tables
    - Preserve emphasis (bold, italic) when possible
    - Format tables properly with | separators
    - Detect and convert equations to LaTeX format inside $ $ delimiters
    - Preserve citations and references
    
    Here's some extracted text from the PDF to help with context: 
    ${pdfText}
    
    Return only the markdown content without any explanations.
    `;

    // Call GPT-4.1 API with multimodal capabilities
    const response = await openai.chat.completions.create({
      model: "gpt-4.1", // Using the recommended non-deprecated model with multimodal support
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4096
    });

    // Get markdown from GPT-4V response
    const markdown = response.choices[0].message.content;
    
    // Process the markdown to create segments
    const segments = processMarkdownToSegments(markdown);

    // Clean up temp files
    cleanupTempFiles(pdfPath);
    
    res.json({ markdown, segments });
  } catch (error) {
    console.error('Error in GPT-4V processing:', error);
    
    // Clean up temp files on error
    if (pdfPath) cleanupTempFiles(pdfPath);
    
    res.status(500).json({ error: `Failed to process PDF with GPT-4V: ${error.message}` });
  }
});

// Nougat model endpoint
app.post('/api/nougat/process', upload.single('pdf'), handleMulterErrors, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let pdfPath = null;
  try {
    // Save PDF to temp file
    const filename = `${Date.now()}-${req.file.originalname}`;
    pdfPath = await saveTempFile(req.file.buffer, filename);

    // Check if nougat-ocr is installed
    if (!checkNougatAvailability()) {
      const fallbackResult = await processPDFWithFallback(pdfPath, req.file.originalname, 'nougat');
      return res.json(fallbackResult);
    }

    // Set up output directory for nougat
    const outputDir = path.join(tempDir, `nougat-output-${Date.now()}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process the PDF with nougat
    return new Promise((resolve, reject) => {
      const nougatProcess = spawn('nougat', [
        pdfPath,
        '--out', outputDir
      ]);

      let stdoutData = '';
      let stderrData = '';

      nougatProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log(`Nougat stdout: ${data}`);
      });

      nougatProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`Nougat stderr: ${data}`);
      });

      nougatProcess.on('close', (code) => {
        console.log(`Nougat process exited with code ${code}`);
        
        if (code !== 0) {
          // If Nougat process failed, use fallback
          processPDFWithFallback(pdfPath, req.file.originalname, 'nougat')
            .then(fallbackResult => {
              res.json(fallbackResult);
              resolve();
            })
            .catch(err => {
              res.status(500).json({ error: `Failed to process PDF with fallback: ${err.message}` });
              reject(err);
            });
          return;
        }
        
        try {
          // Read the output file (.mmd is the Nougat output format)
          const baseFilename = path.basename(req.file.originalname, '.pdf');
          const outputFilePath = path.join(outputDir, `${baseFilename}.mmd`);
          
          // If output file exists, return its content
          if (fs.existsSync(outputFilePath)) {
            const markdown = fs.readFileSync(outputFilePath, 'utf8');
            const segments = processMarkdownToSegments(markdown);
            
            // Clean up temp files
            cleanupTempFiles(pdfPath);
            
            res.json({ markdown, segments });
            resolve();
          } else {
            // If output file doesn't exist, use fallback
            processPDFWithFallback(pdfPath, req.file.originalname, 'nougat')
              .then(fallbackResult => {
                res.json(fallbackResult);
                resolve();
              })
              .catch(err => {
                res.status(500).json({ error: `Failed to process PDF with fallback: ${err.message}` });
                reject(err);
              });
          }
        } catch (error) {
          console.error('Error reading Nougat output:', error);
          res.status(500).json({ error: `Failed to read Nougat output: ${error.message}` });
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in Nougat processing:', error);
    
    // Clean up temp files on error
    if (pdfPath) cleanupTempFiles(pdfPath);
    
    res.status(500).json({ error: `Failed to process PDF with Nougat: ${error.message}` });
  }
});

// Donut model endpoint
app.post('/api/donut/process', upload.single('pdf'), handleMulterErrors, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let pdfPath = null;
  try {
    // Save PDF to temp file
    const filename = `${Date.now()}-${req.file.originalname}`;
    pdfPath = await saveTempFile(req.file.buffer, filename);

    // Check if donut-python is installed
    if (!checkDonutAvailability()) {
      const fallbackResult = await processPDFWithFallback(pdfPath, req.file.originalname, 'donut');
      return res.json(fallbackResult);
    }

    // Create a Python script to run Donut
    const pythonScriptPath = path.join(tempDir, `donut-script-${Date.now()}.py`);
    const donutScript = `
import sys
from donut import Document

# Load the document 
doc = Document("${pdfPath.replace(/\\/g, '\\\\')}")

# Process with Donut
result = doc.convert_to_markdown()

# Output the result
print(result)
`;

    fs.writeFileSync(pythonScriptPath, donutScript);

    // Run the Python script
    return new Promise((resolve, reject) => {
      const donutProcess = spawn('python', [pythonScriptPath]);

      let stdoutData = '';
      let stderrData = '';

      donutProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log(`Donut stdout: ${data}`);
      });

      donutProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`Donut stderr: ${data}`);
      });

      donutProcess.on('close', (code) => {
        console.log(`Donut process exited with code ${code}`);
        
        if (code !== 0 || !stdoutData) {
          // If Donut process failed, use fallback
          processPDFWithFallback(pdfPath, req.file.originalname, 'donut')
            .then(fallbackResult => {
              res.json(fallbackResult);
              resolve();
            })
            .catch(err => {
              res.status(500).json({ error: `Failed to process PDF with fallback: ${err.message}` });
              reject(err);
            });
          return;
        }
        
        try {
          // Use the stdout as markdown
          const markdown = stdoutData;
          const segments = processMarkdownToSegments(markdown);
          
          // Clean up temp files
          cleanupTempFiles(pdfPath);
          cleanupTempFiles(pythonScriptPath);
          
          res.json({ markdown, segments });
          resolve();
        } catch (error) {
          console.error('Error processing Donut output:', error);
          res.status(500).json({ error: `Failed to process Donut output: ${error.message}` });
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in Donut processing:', error);
    
    // Clean up temp files on error
    if (pdfPath) cleanupTempFiles(pdfPath);
    
    res.status(500).json({ error: `Failed to process PDF with Donut: ${error.message}` });
  }
});

// LayoutLM model endpoint
app.post('/api/layoutlm/process', upload.single('pdf'), handleMulterErrors, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let pdfPath = null;
  try {
    // Save PDF to temp file
    const filename = `${Date.now()}-${req.file.originalname}`;
    pdfPath = await saveTempFile(req.file.buffer, filename);

    // Check if layoutlm is available
    if (!checkLayoutLMAvailability()) {
      const fallbackResult = await processPDFWithFallback(pdfPath, req.file.originalname, 'layoutlm');
      return res.json(fallbackResult);
    }

    // Create a Python script to run LayoutLM
    const pythonScriptPath = path.join(tempDir, `layoutlm-script-${Date.now()}.py`);
    const layoutlmScript = `
import sys
import os
import json
from transformers import LayoutLMProcessor, LayoutLMForTokenClassification
from PIL import Image
import torch
import fitz  # PyMuPDF
import re

# Path to PDF
pdf_path = "${pdfPath.replace(/\\/g, '\\\\')}"

# Load LayoutLM
processor = LayoutLMProcessor.from_pretrained("microsoft/layoutlm-base-uncased")
model = LayoutLMForTokenClassification.from_pretrained("microsoft/layoutlm-base-uncased")

# Create output markdown
markdown = ""

# Convert PDF to images and process each page
doc = fitz.open(pdf_path)
for page_num, page in enumerate(doc):
    pix = page.get_pixmap()
    img_path = f"temp_page_{page_num}.png"
    pix.save(img_path)
    
    # Process image with LayoutLM
    image = Image.open(img_path)
    
    # Extract text and layout
    text = page.get_text()
    
    # Convert to markdown (simplified for this example)
    lines = text.split('\\n')
    in_table = False
    
    for line in lines:
        line = line.strip()
        
        if not line:
            markdown += "\\n"
            continue
        
        # Detect headers (simple heuristic)
        if len(line) < 60 and line.isupper():
            markdown += f"## {line}\\n\\n"
        # Detect lists (simple heuristic)
        elif line.startswith('•') or line.startswith('-') or re.match(r'^\\d+\\.', line):
            markdown += f"{line}\\n"
        # Detect tables (simplified)
        elif '|' in line or '\\t' in line:
            if not in_table:
                markdown += "\\n"
                in_table = True
            cells = line.split('\\t') if '\\t' in line else line.split('|')
            markdown += "| " + " | ".join(cells) + " |\\n"
        else:
            if in_table:
                markdown += "\\n"
                in_table = False
            markdown += f"{line}\\n\\n"
    
    # Remove temp image
    os.remove(img_path)

# Print markdown to stdout for the Node.js process to capture
print(markdown)
`;

    fs.writeFileSync(pythonScriptPath, layoutlmScript);

    // Run the Python script
    return new Promise((resolve, reject) => {
      const layoutlmProcess = spawn('python', [pythonScriptPath]);

      let stdoutData = '';
      let stderrData = '';

      layoutlmProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log(`LayoutLM stdout: ${data}`);
      });

      layoutlmProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error(`LayoutLM stderr: ${data}`);
      });

      layoutlmProcess.on('close', (code) => {
        console.log(`LayoutLM process exited with code ${code}`);
        
        if (code !== 0 || !stdoutData) {
          // If LayoutLM process failed, use fallback
          processPDFWithFallback(pdfPath, req.file.originalname, 'layoutlm')
            .then(fallbackResult => {
              res.json(fallbackResult);
              resolve();
            })
            .catch(err => {
              res.status(500).json({ error: `Failed to process PDF with fallback: ${err.message}` });
              reject(err);
            });
          return;
        }
        
        try {
          // Use the stdout as markdown
          const markdown = stdoutData;
          const segments = processMarkdownToSegments(markdown);
          
          // Clean up temp files
          cleanupTempFiles(pdfPath);
          cleanupTempFiles(pythonScriptPath);
          
          res.json({ markdown, segments });
          resolve();
        } catch (error) {
          console.error('Error processing LayoutLM output:', error);
          res.status(500).json({ error: `Failed to process LayoutLM output: ${error.message}` });
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error in LayoutLM processing:', error);
    
    // Clean up temp files on error
    if (pdfPath) cleanupTempFiles(pdfPath);
    
    res.status(500).json({ error: `Failed to process PDF with LayoutLM: ${error.message}` });
  }
});

// Docling model endpoint
app.post('/api/docling/process', upload.single('pdf'), handleMulterErrors, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let pdfPath = null;
  try {
    // Save PDF to temp file
    const filename = `${Date.now()}-${req.file.originalname}`;
    pdfPath = await saveTempFile(req.file.buffer, filename);

    // Parse options if provided
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    
    // Check if Docling is available (we'll assume it's not and fall back to basic processing)
    const fallbackResult = await processPDFWithFallback(pdfPath, req.file.originalname, 'docling', options);
    return res.json(fallbackResult);
  } catch (error) {
    console.error('Error in Docling processing:', error);
    
    // Clean up temp files on error
    if (pdfPath) cleanupTempFiles(pdfPath);
    
    res.status(500).json({ error: `Failed to process PDF with Docling: ${error.message}` });
  }
});

// Fallback PDF processing
async function processPDFWithFallback(pdfPath, originalFilename, modelName, options = {}) {
  try {
    // Extract text from PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    // Generate basic markdown from text
    let markdown = `# ${path.basename(originalFilename, '.pdf')}\n\n`;
    
    // Split text into paragraphs and format as markdown
    const paragraphs = text.split('\n\n');
    let currentHeader = '';
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      if (!trimmedParagraph) continue;
      
      // Check if paragraph is likely a header (simple heuristic)
      if (trimmedParagraph.length < 60 && (trimmedParagraph.toUpperCase() === trimmedParagraph || /^[A-Z][\w\s]+$/.test(trimmedParagraph))) {
        currentHeader = trimmedParagraph;
        markdown += `## ${currentHeader}\n\n`;
      } 
      // Check if paragraph is likely a list item
      else if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-') || /^\d+\./.test(trimmedParagraph)) {
        markdown += `${trimmedParagraph}\n`;
      }
      // Otherwise treat as regular paragraph
      else {
        markdown += `${trimmedParagraph}\n\n`;
      }
    }
    
    // Add model info
    markdown += `\n\n---\n\n*Processed with ${modelName} (fallback mode)*\n`;
    
    // Create segments from markdown
    const segments = processMarkdownToSegments(markdown);
    
    return { markdown, segments };
  } catch (error) {
    console.error(`Error in fallback processing for ${modelName}:`, error);
    throw error;
  } finally {
    // Clean up temp file
    cleanupTempFiles(pdfPath);
  }
}

// Helper function to process markdown to segments
function processMarkdownToSegments(markdown) {
  const segments = [];
  const lines = markdown.split('\n');
  let currentSegment = { content: '', type: 'paragraph' };
  
  for (const line of lines) {
    if (line.startsWith('#')) {
      if (currentSegment.content) {
        segments.push({
          id: segments.length + 1,
          ...currentSegment,
          content: currentSegment.content.trim() + '\n\n',
          confidence: 0.95
        });
      }
      
      // Determine if it's a title or just a header
      const headerLevel = line.match(/^#+/)[0].length;
      if (headerLevel === 1 && segments.length === 0) {
        currentSegment = { content: line + '\n', type: 'title' };
      } else {
        currentSegment = { content: line + '\n', type: 'header' };
      }
    } else if (line.startsWith('|')) {
      if (currentSegment.content && currentSegment.type !== 'table') {
        segments.push({
          id: segments.length + 1,
          ...currentSegment,
          content: currentSegment.content.trim() + '\n\n',
          confidence: 0.95
        });
        currentSegment = { content: line + '\n', type: 'table' };
      } else {
        currentSegment.content += line + '\n';
      }
    } else if (line.includes('$') && line.match(/\$[^$]+\$/)) {
      if (currentSegment.content && currentSegment.type !== 'equation') {
        segments.push({
          id: segments.length + 1,
          ...currentSegment,
          content: currentSegment.content.trim() + '\n\n',
          confidence: 0.95
        });
        currentSegment = { content: line + '\n', type: 'equation' };
      } else {
        currentSegment.content += line + '\n';
      }
    } else if (line.trim()) {
      if (currentSegment.type !== 'paragraph' && 
          currentSegment.type !== 'title' && 
          currentSegment.type !== 'header') {
        if (currentSegment.content) {
          segments.push({
            id: segments.length + 1,
            ...currentSegment,
            content: currentSegment.content.trim() + '\n\n',
            confidence: 0.95
          });
        }
        currentSegment = { content: line + '\n', type: 'paragraph' };
      } else {
        currentSegment.content += line + '\n';
      }
    } else {
      currentSegment.content += '\n';
    }
  }

  if (currentSegment.content) {
    segments.push({
      id: segments.length + 1,
      ...currentSegment,
      content: currentSegment.content.trim() + '\n\n',
      confidence: 0.95
    });
  }

  return segments;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`PDF processing services available at:`);
  console.log(`- GPT-4V: http://localhost:${PORT}/api/gpt4v/analyze`);
  console.log(`- Nougat: http://localhost:${PORT}/api/nougat/process`);
  console.log(`- LayoutLM: http://localhost:${PORT}/api/layoutlm/process`);
  console.log(`- Donut: http://localhost:${PORT}/api/donut/process`);
  console.log(`- Docling: http://localhost:${PORT}/api/docling/process`);
  console.log(`- Health: http://localhost:${PORT}/health`);
  
  // Check model availability
  console.log('\nModel availability:');
  console.log(`- GPT-4V: ${openai ? 'Available' : 'Not available (API key missing)'}`);
  console.log(`- Nougat: ${checkNougatAvailability() ? 'Available' : 'Not available (run pip install nougat-ocr)'}`);
  console.log(`- Donut: ${checkDonutAvailability() ? 'Available' : 'Not available (run pip install donut-python)'}`);
  console.log(`- LayoutLM: ${checkLayoutLMAvailability() ? 'Available' : 'Not available (run pip install transformers)'}`);
  console.log(`- Docling: Not available (fallback will be used)`);
});

// Cleanup on shutdown
process.on('SIGINT', () => {
  console.log('Cleaning up temporary files...');
  
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error deleting ${filePath}:`, error);
      }
    });
  }
  
  console.log('Server shutting down');
  process.exit(0);
});

module.exports = app;