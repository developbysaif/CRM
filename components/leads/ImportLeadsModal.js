'use client';
import { useState, useRef } from 'react';
import { Modal, Button } from '@/components/ui/index';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download, X, Loader2 } from 'lucide-react';

export default function ImportLeadsModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setError(null);
    setImportSummary(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error('File must contain a header row and at least one data row.');

    // Parse CSV line handling quotes
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const hdrs = parseLine(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
      const row = {};
      hdrs.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      records.push(row);
    }

    return { headers: hdrs, records };
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setImportSummary(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result;
        if (typeof content !== 'string') return;

        if (selected.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (!Array.isArray(json)) throw new Error('JSON file must contain an array of lead objects.');
          const hdrs = Object.keys(json[0] || {});
          setHeaders(hdrs);
          setParsedData(json);
        } else {
          const { headers: hdrs, records } = parseCSV(content);
          setHeaders(hdrs);
          setParsedData(records);
        }
      } catch (err) {
        setError(err.message || 'Failed to parse file. Please verify format.');
      }
    };

    reader.readAsText(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const fakeEvent = { target: { files: [dropped] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDownloadSample = () => {
    const sample = `Name,Company,Email,Phone,Website,Industry,City,Budget,Status
John Smith,Zenith Tech,john@zenith.com,+1 212-555-0144,zenith.com,Software,New York,$10,000,New Lead
Sarah Connor,Cyberdyne Systems,sarah@cyberdyne.io,+1 312-555-0199,cyberdyne.io,AI Startup,Chicago,$25,000,Qualified
Marcus Aurelius,Apex Real Estate,marcus@apexrealty.com,+1 415-555-0188,apexrealty.com,Real Estate,San Francisco,$15,000,New Lead`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm_leads_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadSubmit = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: parsedData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed');

      setImportSummary(data.data || { importedCount: parsedData.length });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit file import');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Leads from File (CSV / JSON)" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Template Download Prompt */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Need a formatted file? Download our sample CSV template.</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Template.csv
          </button>
        </div>

        {/* Dropzone */}
        {!file && !importSummary && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/30 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag and drop your file here, or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports CSV and JSON files (up to 1,000 records per upload)
            </p>
          </div>
        )}

        {/* File Selected & Preview */}
        {file && !importSummary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{file.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Parsed Rows Stats */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>Found <strong>{parsedData.length}</strong> record(s) ready to import</span>
              <span className="text-slate-400">Showing first {Math.min(parsedData.length, 3)} rows</span>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-48 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    {headers.slice(0, 5).map((h, i) => (
                      <th key={i} className="p-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {parsedData.slice(0, 3).map((row, i) => (
                    <tr key={i} className="text-slate-700 dark:text-slate-300">
                      {headers.slice(0, 5).map((h, j) => (
                        <td key={j} className="p-2.5 truncate max-w-[140px]">{row[h] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Upload Action */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={resetState}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={isProcessing ? Loader2 : UploadCloud}
                loading={isProcessing}
                onClick={handleUploadSubmit}
              >
                Confirm & Import {parsedData.length} Leads
              </Button>
            </div>
          </div>
        )}

        {/* Success Report */}
        {importSummary && (
          <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              Import Completed Successfully!
            </h4>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 block">
                  {importSummary.importedCount || 0}
                </span>
                <span>Imported</span>
              </div>
              <div>
                <span className="text-xl font-black text-amber-600 block">
                  {importSummary.duplicateCount || 0}
                </span>
                <span>Duplicates Filtered</span>
              </div>
              <div>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200 block">
                  {importSummary.totalProcessed || importSummary.importedCount || 0}
                </span>
                <span>Total Read</span>
              </div>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={handleClose}>
                Done & View Leads
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
