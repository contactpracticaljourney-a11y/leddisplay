import React, { useState } from 'react';
import { Download, Monitor, WifiOff, CheckCircle2, X, Laptop, ShieldCheck, Copy, ExternalLink, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const APP_DIRECT_URL = 'https://ais-pre-icg2tncz6wjmg3nzavpqbf-737125771788.asia-northeast1.run.app';

export const OfflineInstallModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_DIRECT_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Top Bar Offline Desktop App Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/40 text-cyan-200 text-xs font-mono-tech transition-all cursor-pointer shadow-lg hover:border-cyan-300 hover:text-white"
        title="Run or Install PPT Offline on Desktop"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        <span className="font-semibold text-[11px]">RUN OFFLINE / INSTALL</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#070d1a] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] relative text-slate-100 font-sans">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-4 border-b border-cyan-500/20 pb-3">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                  Run Presentation Offline
                </h3>
                <p className="text-xs text-cyan-300/80 font-mono-tech">
                  Direct Desktop App Link & Offline Capability
                </p>
              </div>
            </div>

            {/* Direct Link Section */}
            <div className="mb-4 bg-slate-900/90 p-3 rounded-xl border border-cyan-500/30">
              <label className="block text-[11px] font-mono-tech uppercase text-cyan-400 font-semibold mb-1.5">
                Direct Presentation Link (PC / Desktop):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={APP_DIRECT_URL}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy Direct Link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={APP_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100% Offline 3D WebGL Models, Audio Synthesis & Voice Engine</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>No Browser Address Bar or Internet connection needed once installed</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Full PC Desktop shortcut integration on Windows & Mac</span>
              </div>
            </div>

            {/* Installation Action Section */}
            {isInstalled ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 text-center space-y-1 mb-4">
                <div className="flex items-center justify-center space-x-2 text-emerald-300 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PPT App is Installed on your Desktop!</span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  You can launch this presentation anytime directly from your PC Start Menu or Desktop shortcut offline.
                </p>
              </div>
            ) : isInstallable ? (
              <button
                onClick={async () => {
                  await install();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-orbitron font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer mb-4"
              >
                <Monitor className="w-4 h-4" />
                <span>INSTALL APP TO DESKTOP NOW</span>
              </button>
            ) : (
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 text-xs text-cyan-200 mb-4 space-y-1.5">
                <div className="flex items-center space-x-2 font-semibold text-cyan-300">
                  <WifiOff className="w-4 h-4" />
                  <span>Desktop Installation Steps:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                  <li>Open the direct link above in Chrome or Microsoft Edge on PC.</li>
                  <li>Click the <strong>Install App icon</strong> in top-right address bar (or Menu &gt; Install App).</li>
                  <li>Click <strong>Install</strong> to launch as a standalone Desktop PC application with offline mode!</li>
                </ol>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-tech transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
