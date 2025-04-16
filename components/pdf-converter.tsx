import React from "react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

type ConversionModel = 'combined' | 'gpt4' | 'docling';

export function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<ConversionModel>('combined');
  const [converting, setConverting] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setConverting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    try {
      const response = await fetch('/api/convert-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setMarkdown(data.markdown);
      toast({
        title: "Conversion successful",
        description: `Converted using ${data.model} model`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!markdown) return;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file ? `${file.name.replace('.pdf', '')}.md` : 'converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">PDF to Markdown Converter</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>Select PDF</span>
              </Button>
            </Label>
            {file && <span className="text-sm text-gray-600">{file.name}</span>}
          </div>
        </div>

        <RadioGroup value={model} onValueChange={(value: ConversionModel) => setModel(value)}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="combined" id="combined" />
              <Label htmlFor="combined">Combined Models</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gpt4" id="gpt4" />
              <Label htmlFor="gpt4">GPT-4</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="docling" id="docling" />
              <Label htmlFor="docling">Docling</Label>
            </div>
          </div>
        </RadioGroup>

        <div className="flex space-x-4">
          <Button onClick={handleConvert} disabled={!file || converting}>
            {converting ? 'Converting...' : 'Convert to Markdown'}
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={!markdown}
            variant="outline"
          >
            Download Markdown
          </Button>
        </div>

        {markdown && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Preview:</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{markdown}</pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}