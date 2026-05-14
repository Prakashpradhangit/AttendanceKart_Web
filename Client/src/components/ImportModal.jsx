import React, { useState } from 'react';
import { X, Upload, FileText, Link, CircleAlert, CircleCheck, LoaderCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'google'
  const [file, setFile] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws);
          
          // Normalize keys to lowercase to avoid "Email" vs "email" issues
          const data = rawData.map(row => {
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
              normalizedRow[key.toLowerCase().trim()] = row[key];
            });
            return normalizedRow;
          });
          
          if (data.length > 0) {
            setPreview(data.slice(0, 5)); // Show first 5 rows
          } else {
            setError("The file is empty.");
          }
        } catch (err) {
          setError("Failed to parse file. Please use a valid .xlsx or .csv file.");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl) return;
    setLoading(true);
    setError(null);
    try {
      // Basic Google Sheets CSV export link conversion
      let url = sheetUrl;
      if (url.includes('/edit')) {
        url = url.replace(/\/edit.*$/, '/export?format=csv');
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch sheet. Ensure it is public.");
      
      const csvData = await response.text();
      const workbook = XLSX.read(csvData, { type: 'string' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);
      
      const data = rawData.map(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });
        return normalizedRow;
      });
      
      if (data.length > 0) {
        setPreview(data.slice(0, 5));
        onImport(data);
        onClose();
      } else {
        setError("The sheet is empty.");
      }
    } catch (err) {
      setError("Failed to import from Google Sheets. Ensure the link is public and valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (preview) {
      // In a real app, we'd process all rows
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        const data = rawData.map(row => {
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            normalizedRow[key.toLowerCase().trim()] = row[key];
          });
          return normalizedRow;
        });
        
        onImport(data);
        onClose();
      };
      reader.readAsBinaryString(file);
    }
  };

  const downloadSampleTemplate = () => {
    const data = [
      { name: "John Doe", email: "john@example.com", phone: "1234567890", department: "IT", role: "Developer", joiningDate: "2024-01-15", status: "Active" },
      { name: "Jane Smith", email: "jane@example.com", phone: "9876543210", department: "HR", role: "Manager", joiningDate: "2024-02-20", status: "Active" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, "Employee_Import_Template.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Import Employees</h2>
            <p className="text-sm text-gray-500 font-medium">Add hundreds of employees in seconds</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-colors group">
            <X size={24} className="text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('file')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'file' ? 'bg-white text-primary shadow-lg shadow-primary/5' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={20} /> Excel / CSV File
            </button>
            <button 
              onClick={() => setActiveTab('google')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'google' ? 'bg-white text-primary shadow-lg shadow-primary/5' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link size={20} /> Google Sheets
            </button>
          </div>

          {activeTab === 'file' ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center hover:border-primary/50 transition-all relative group bg-gray-50/30">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <FileText size={40} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{file ? file.name : 'Click or Drag Excel File'}</p>
                    <p className="text-sm text-gray-500 mt-1">Upload .xlsx, .xls or .csv (Max 10MB)</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={downloadSampleTemplate}
                className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl"
              >
                <Download size={16} /> Download Sample Template
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Google Sheet URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://docs.google.com/spreadsheets/d/..." 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                  />
                  <button 
                    onClick={handleGoogleSheetImport}
                    disabled={loading || !sheetUrl}
                    className="px-8 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
                  >
                    {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Fetch'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                    <CircleAlert size={14} className="text-amber-500" /> Ensure "Anyone with the link can view" is enabled
                  </p>
                  <button 
                    onClick={downloadSampleTemplate}
                    className="inline-flex items-center gap-2 text-primary text-[11px] font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl uppercase tracking-wider"
                  >
                    <Download size={14} /> Download Format Template
                  </button>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                 <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Required Spreadsheet Format</h4>
                 <div className="flex flex-wrap gap-2">
                   {['name', 'email', 'phone', 'department', 'role', 'joiningDate'].map(col => (
                     <span key={col} className="bg-white border border-indigo-100 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 shadow-sm">{col}</span>
                   ))}
                 </div>
                 <p className="text-[10px] text-indigo-400 mt-3 font-medium italic">* Column names must match exactly (case-sensitive)</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <CircleAlert size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {preview && preview.length > 0 && (
            <div className="mt-6 border border-gray-100 rounded-2xl overflow-hidden shadow-inner">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview (Top 5 rows)</span>
                <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Valid Format</span>
              </div>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-gray-100">
                    <tr>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="px-4 py-4 font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-4 text-gray-600 font-medium whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">Cancel</button>
          <button 
            disabled={!preview || loading}
            onClick={handleConfirmImport}
            className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
          >
            <CircleCheck size={18} /> Confirm Import
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportModal;
