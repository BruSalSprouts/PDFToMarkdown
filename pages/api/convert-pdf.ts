import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFConverter } from '../../lib/pdf-converter';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ConversionResult {
  markdown: string;
  model: string;
  success: boolean;
  error?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const doclingApiKey = process.env.DOCLING_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversionResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const model = fields.model?.[0] || 'combined';
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    let result: ConversionResult;

    switch (model) {
      case 'gpt4':
        result = await handleGPT4Conversion(file.filepath);
        break;
      case 'docling':
        result = await handleDoclingConversion(file.filepath);
        break;
      case 'combined':
      default:
        const converter = new PDFConverter();
        const markdown = await converter.convertToMarkdown(file.filepath);
        result = {
          markdown,
          model: 'combined',
          success: true,
        };
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'PDF conversion failed',
    });
  }
}

async function handleGPT4Conversion(filePath: string): Promise<ConversionResult> {
  try {
    const base64PDF = fs.readFileSync(filePath, { encoding: 'base64' });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Convert this PDF to markdown format. Preserve all formatting, equations, and structure.',
            },
            {
              type: 'image',
              image_url: {
                url: `data:application/pdf;base64,${base64PDF}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    return {
      markdown: response.choices[0]?.message?.content || '',
      model: 'gpt4',
      success: true,
    };
  } catch (error) {
    throw new Error(`GPT-4 conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDoclingConversion(filePath: string): Promise<ConversionResult> {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('outputFormat', 'markdown');

    const response = await axios.post('https://api.docling.ai/v1/convert', formData, {
      headers: {
        'Authorization': `Bearer ${doclingApiKey}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      markdown: response.data.markdown,
      model: 'docling',
      success: true,
    };
  } catch (error) {
    throw new Error(`Docling conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}