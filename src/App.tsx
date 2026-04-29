/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hash, 
  Type, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  RotateCcw, 
  Settings2,
  AlertCircle,
  Code,
  Binary
} from 'lucide-react';

// --- Utilities ---

const ALPHABETS = {
  Base2: '01',
  Base8: '01234567',
  Base10: '0123456789',
  Base16: '0123456789abcdef',
  Base32: 'abcdefghijklmnopqrstuvwxyz234567',
  Base36: '0123456789abcdefghijklmnopqrstuvwxyz',
  Base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', // Bitcoin
  Base62: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  Base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
};

type Mode = 'number' | 'text';

function encodeBaseN(input: string, alphabet: string, mode: Mode): string {
  if (!input || !alphabet) return '';
  
  try {
    let value: bigint;
    
    if (mode === 'text') {
      // Convert text strings to byte representation then to BigInt
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input);
      let hex = '';
      for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
      }
      value = BigInt('0x' + hex);
    } else {
      // Treat input as a decimal number
      value = BigInt(input.replace(/[^0-9]/g, ''));
    }

    if (value === 0n) return alphabet[0];

    const base = BigInt(alphabet.length);
    let result = '';
    while (value > 0n) {
      result = alphabet[Number(value % base)] + result;
      value = value / base;
    }
    return result;
  } catch (e) {
    return 'Error: Invalid input';
  }
}

function decodeBaseN(input: string, alphabet: string, mode: Mode): string {
  if (!input || !alphabet) return '';

  try {
    const base = BigInt(alphabet.length);
    let value = 0n;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const charIndex = alphabet.indexOf(char);
      if (charIndex === -1) throw new Error('Invalid character');
      value = value * base + BigInt(charIndex);
    }

    if (mode === 'text') {
      let hex = value.toString(16);
      if (hex.length % 2 !== 0) hex = '0' + hex;
      const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } else {
      return value.toString();
    }
  } catch (e) {
    return 'Error: Invalid character or overflow';
  }
}

// --- Components ---

export default function App() {
  const [mode, setMode] = useState<Mode>('text');
  const [inputMode, setInputMode] = useState<'encode' | 'decode'>('encode');
  const [alphabet, setAlphabet] = useState(ALPHABETS.Base62);
  const [customAlphabet, setCustomAlphabet] = useState('');
  const [inputText, setInputText] = useState('Numerical alchemy transforms data through the root of modern cryptography.');
  const [copied, setCopied] = useState(false);

  const effectiveAlphabet = useMemo(() => {
    return alphabet === 'CUSTOM' ? customAlphabet : alphabet;
  }, [alphabet, customAlphabet]);

  const result = useMemo(() => {
    if (!inputText || !effectiveAlphabet) return '';
    if (inputMode === 'encode') {
      return encodeBaseN(inputText, effectiveAlphabet, mode);
    } else {
      return decodeBaseN(inputText, effectiveAlphabet, mode);
    }
  }, [inputText, effectiveAlphabet, mode, inputMode]);

  const handleCopy = () => {
    if (result && !result.startsWith('Error')) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const swapDirections = () => {
    setInputMode(prev => prev === 'encode' ? 'decode' : 'encode');
    if (result && !result.startsWith('Error')) {
      setInputText(result);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-stone-300 font-sans selection:bg-stone-500/30 flex justify-center items-center py-8">
      {/* Container with fixed-ish dimensions for the "sophisticated" feel, but responsive */}
      <div className="w-full max-w-5xl bg-[#0c0c0d] text-stone-300 font-sans flex flex-col overflow-hidden border border-stone-800 shadow-2xl relative">
        
        {/* Top Navigation / Branding */}
        <header className="flex flex-col sm:flex-row items-center justify-between px-10 py-8 border-b border-stone-800/50 bg-[#0c0c0d] gap-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif italic text-stone-100 leading-tight tracking-tight">Radix.N</h1>
            <span className="text-[10px] uppercase tracking-[0.4em] text-stone-500 font-medium whitespace-nowrap">Variable Encoder & Decoder</span>
          </div>
          <div className="flex items-center gap-6 md:gap-12 w-full sm:w-auto justify-center sm:justify-end">
            <nav className="flex gap-4 md:gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              <button 
                onClick={() => setInputMode('encode')}
                className={`transition-colors whitespace-nowrap ${inputMode === 'encode' ? 'text-stone-100 border-b border-stone-100 pb-1' : 'hover:text-stone-300'}`}
              >
                Encoding
              </button>
              <button 
                onClick={() => setInputMode('decode')}
                className={`transition-colors whitespace-nowrap ${inputMode === 'decode' ? 'text-stone-100 border-b border-stone-100 pb-1' : 'hover:text-stone-300'}`}
              >
                Decoding
              </button>
              <button className="hover:text-stone-300 transition-colors hidden md:block">History</button>
            </nav>
            <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-500 text-xs hover:border-stone-400 cursor-pointer hidden sm:flex shrink-0">
              ?
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row px-6 md:px-10 py-10 gap-10 bg-[radial-gradient(circle_at_top_right,_#1a1a1c_0%,_#0c0c0d_40%)]">
          
          {/* Side Control Panel */}
          <aside className="w-full lg:w-72 flex flex-col gap-10 border-b lg:border-b-0 lg:border-r border-stone-800/50 pb-10 lg:pb-0 lg:pr-10">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block mb-6 font-bold">Target Radix</label>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-serif text-stone-100 leading-none">{(effectiveAlphabet?.length || 0).toString().padStart(2, '0')}</span>
                <span className="text-sm text-stone-600 font-serif italic">base</span>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-2">
                {(['text', 'number'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 text-[10px] uppercase tracking-widest py-2 rounded border transition-all ${
                      mode === m 
                        ? 'bg-stone-200 text-stone-900 border-stone-200 font-bold' 
                        : 'bg-transparent text-stone-500 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    {m} MODE
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block mb-4 font-bold">Alphabet Protocol</label>
              <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(ALPHABETS).map(([key, val]) => (
                  <li 
                    key={key}
                    onClick={() => setAlphabet(val)}
                    className={`flex items-center justify-between text-[11px] p-3 rounded border transition-all cursor-pointer group ${
                      alphabet === val 
                        ? 'bg-stone-900 border-stone-700 text-stone-100' 
                        : 'border-stone-800/40 text-stone-600 hover:border-stone-700 hover:text-stone-400'
                    }`}
                  >
                    <span>{key}</span>
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${alphabet === val ? 'bg-stone-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-transparent'}`}></span>
                  </li>
                ))}
                <li 
                  onClick={() => setAlphabet('CUSTOM')}
                  className={`flex items-center justify-between text-[11px] p-3 rounded border transition-all cursor-pointer ${
                    alphabet === 'CUSTOM' 
                      ? 'bg-stone-900 border-stone-700 text-stone-100' 
                      : 'border-stone-800/40 text-stone-600 hover:border-stone-700'
                  }`}
                >
                  <span>Custom Registry</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${alphabet === 'CUSTOM' ? 'bg-stone-300' : 'bg-transparent'}`}></span>
                </li>
              </ul>

              <AnimatePresence>
                {alphabet === 'CUSTOM' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <input
                      type="text"
                      value={customAlphabet}
                      onChange={(e) => setCustomAlphabet(e.target.value)}
                      placeholder="Enter unique charset..."
                      className="w-full bg-[#09090a] border border-stone-700 p-3 font-mono text-[11px] text-stone-300 focus:outline-none focus:border-stone-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-4">
               <button 
                onClick={swapDirections}
                className="w-full py-4 border border-stone-800 text-stone-400 font-serif italic text-sm hover:text-stone-200 hover:border-stone-600 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Swap Orientation
              </button>
              <button 
                onClick={() => setInputText('')}
                className="w-full py-4 bg-stone-100 text-stone-900 font-serif italic text-lg hover:bg-white transition-all shadow-[0_10px_30px_-10px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Clear Slate
              </button>
            </div>
          </aside>

          {/* Main Workspace */}
          <section className="flex-1 flex flex-col gap-10">
            <div className="flex flex-col flex-1 min-h-[240px]">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Source Input</label>
                <span className="text-[10px] text-stone-600 font-mono flex items-center gap-2">
                  {inputMode === 'encode' ? (mode === 'text' ? 'UTF-8' : 'DECIMAL') : `BASE ${effectiveAlphabet.length}`}
                  <span className="w-px h-3 bg-stone-800 mx-1"></span>
                  {inputText.length} BYTES
                </span>
              </div>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#09090a] border border-stone-800 p-8 font-mono text-sm leading-relaxed text-stone-400 focus:outline-none focus:border-stone-600 resize-none transition-all focus:bg-[#0b0b0d]"
                spellcheck="false"
                placeholder="Initial trace..."
              />
            </div>

            <div className="flex flex-col flex-1 min-h-[240px]">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Resultant Sequence</label>
                <div className="flex gap-6">
                  {result && !result.startsWith('Error') && (
                    <button 
                      onClick={handleCopy}
                      className="text-[10px] uppercase tracking-[0.1em] text-stone-400 hover:text-stone-100 transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check className="w-3 h-3 text-stone-200" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Captured' : 'Copy'}
                    </button>
                  )}
                  <button className="text-[10px] uppercase tracking-[0.1em] text-stone-400 hover:text-stone-100 transition-colors">Export</button>
                </div>
              </div>
              <div className={`flex-1 bg-[#09090a] border border-stone-800 p-8 font-mono text-sm leading-relaxed break-all overflow-auto transition-all ${
                result.startsWith('Error') ? 'text-red-900/60 border-red-900/20' : 'text-stone-100'
              }`}>
                {result || <span className="text-stone-800 italic select-none">Awaiting transmutation...</span>}
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Status Bar */}
        <footer className="px-10 py-6 border-t border-stone-800/50 bg-[#0c0c0d] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-10 order-2 md:order-1">
            <div className="flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${result.startsWith('Error') ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold tracking-[0.3em]">
                {result.startsWith('Error') ? 'Logic Violation' : 'System Operational'}
              </span>
            </div>
            <div className="hidden lg:block text-[10px] uppercase tracking-widest text-stone-600 font-medium">
              Precision: <span className="text-stone-400">Fixed BigInt</span>
            </div>
          </div>
          <div className="flex items-center gap-10 text-[10px] text-stone-600 order-1 md:order-2">
            <div className="flex items-center gap-4">
              <span className="hover:text-stone-400 cursor-pointer transition-colors">Audit Logs</span>
              <span className="w-px h-3 bg-stone-800"></span>
              <span className="hover:text-stone-400 cursor-pointer font-serif italic text-xs text-stone-400 tracking-wide">
                v2.4.0-stable
              </span>
            </div>
          </div>
        </footer>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-700/5 blur-[120px] pointer-events-none rounded-full" />
      </div>
    </div>
  );
}
