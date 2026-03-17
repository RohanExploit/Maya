"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, FileImage, ShieldCheck, AlertTriangle, ShieldAlert, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ResultType = "Real" | "Fake" | "Suspicious";

interface AnalysisResult {
  result: ResultType;
  confidence: number;
  explanation: string[];
  source: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('audio/')) {
      setError("Unsupported file format. Please upload an image or audio file.");
      setFile(null);
      setPreview(null);
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("audio");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.startsWith('image/') ? 'image' : 'audio');

    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 400 && errorData.error) {
           throw new Error(errorData.error);
        }
        if (errorData.result) {
            // Catastrophic API route error handled elegantly via Fallback Heuristic
            setResult(errorData);
            setIsAnalyzing(false);
            return;
        }
        throw new Error('Analysis request failed.');
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getResultColorClass = (resType: ResultType) => {
    if (resType === "Fake") return "text-red-500 border-red-500/50 bg-red-500/10";
    if (resType === "Suspicious") return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
    return "text-green-500 border-green-500/50 bg-green-500/10";
  };
  
  const getResultIcon = (resType: ResultType) => {
    if (resType === "Fake") return <ShieldAlert className="w-8 h-8 text-red-500" />;
    if (resType === "Suspicious") return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    return <ShieldCheck className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex flex-col items-center py-16 px-4 font-sans selection:bg-purple-500/30">
      
      <div className="max-w-3xl w-full flex flex-col items-center space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">
              DeepShield <span className="text-purple-400">AI</span>
            </h1>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto text-lg font-medium">
            Next-gen deepfake detection for images and audio. Upload media below to verify its authenticity.
          </p>
        </div>

        {/* Upload / Preview Area */}
        <AnimatePresence mode="wait">
          {!file && (
            <motion.div
              layoutId="upload-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-purple-500/50 cursor-pointer ${
                isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/10"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*, audio/*"
                onChange={handleFileSelect}
              />
              <div className="p-5 bg-white/5 rounded-full mb-6 relative group inline-block">
                 <UploadCloud className="w-12 h-12 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop media</h3>
              <p className="text-gray-500 text-sm">Or click to browse from your device</p>
              <div className="mt-8 flex items-center space-x-4 text-xs text-gray-500 font-medium">
                <span className="flex items-center"><FileImage className="w-4 h-4 mr-1" /> Images</span>
                <span className="flex items-center"><FileAudio className="w-4 h-4 mr-1" /> Audio</span>
              </div>
            </motion.div>
          )}

          {file && (
            <motion.div
              layoutId="upload-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-purple-900/10"
            >
              <div className="w-full md:w-1/2 p-1 relative min-h-[300px] flex items-center justify-center bg-black/40">
                 {preview === "audio" ? (
                   <div className="flex flex-col items-center text-center text-gray-400 p-8">
                     <FileAudio className="w-20 h-20 mb-4 text-blue-400 opacity-80" />
                     <p className="font-medium text-lg text-gray-300 break-all">{file.name}</p>
                     <p className="text-sm mt-2 opacity-60">Audio File • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                 ) : (
                   <img src={preview!} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                 )}
              </div>

              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white/5">
                {!result && !isAnalyzing && (
                   <div className="space-y-6 max-w-xs mx-auto text-center w-full">
                     <h3 className="text-2xl font-semibold text-white">Ready to Analyze</h3>
                     <p className="text-gray-400 text-sm">Runs through primary HuggingFace API with robust OSS multi-tier fallbacks.</p>
                     <button
                        onClick={analyze}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                     >
                       Analyze Media
                     </button>
                     <button onClick={reset} className="w-full text-sm text-gray-500 hover:text-white transition-colors">
                       Cancel
                     </button>
                   </div>
                )}

                {isAnalyzing && (
                  <div className="flex flex-col items-center text-center space-y-6 text-purple-400 py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Analyzing...</h3>
                      <p className="text-sm text-gray-400">Evaluating multi-layered artifacts</p>
                    </div>
                  </div>
                )}

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col h-full justify-between space-y-6"
                  >
                    <div className={`p-6 rounded-2xl border ${getResultColorClass(result.result)} flex items-start space-x-4`}>
                      {getResultIcon(result.result)}
                      <div>
                        <h2 className="text-2xl font-bold uppercase tracking-wide">{result.result}</h2>
                        <div className="mt-4 space-y-2">
                           {result.explanation.map((exp, i) => (
                             <p key={i} className="text-sm flex items-start opacity-90"><Info className="w-4 h-4 mr-2 mt-0.5 shrink-0" /> {exp}</p>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-400">Confidence Score</span>
                        <span className="text-white">{result.confidence}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${result.result === "Fake" ? "bg-red-500" : result.result === "Real" ? "bg-green-500" : "bg-yellow-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                      <span>Source: <strong className="text-gray-300 px-2 py-1 bg-white/5 rounded-md">{result.source}</strong></span>
                      <button onClick={reset} className="text-purple-400 hover:text-purple-300 font-medium">Test another</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg mx-auto bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm flex items-center justify-center">
             <AlertTriangle className="w-4 h-4 mr-2" />
             {error}
           </motion.div>
        )}
      </div>
      
    </div>
  );
}
