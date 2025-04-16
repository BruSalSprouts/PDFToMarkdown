import { spawn } from 'child_process';
import path from 'path';

export class PDFConverter {
  private pythonScript: string;

  constructor() {
    this.pythonScript = path.join(process.cwd(), 'Scripts', 'convert_pdf.py');
  }

  async convertToMarkdown(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = filePath.replace(/\.pdf$/, '.md');
      
      const pythonProcess = spawn('python', [
        this.pythonScript,
        filePath,
        '--output',
        outputPath
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python conversion failed: ${stderr}`));
          return;
        }

        // Read the generated markdown file
        const fs = require('fs');
        try {
          const markdown = fs.readFileSync(outputPath, 'utf8');
          // Clean up the temporary markdown file
          fs.unlinkSync(outputPath);
          resolve(markdown);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}