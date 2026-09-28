import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function AffiliateRedirect({ isOpen, onClose, providerName, targetUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900">Securing your connection</h3>
        <p className="text-sm text-gray-500 mt-2">
          We are transferring you directly to <span className="font-semibold text-gray-800">{providerName}</span> to finalize your reservation safely.
        </p>

        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 my-4 text-xs text-gray-400 truncate">
          {targetUrl}
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Go Back
          </button>
          <a 
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
          >
            Proceed <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}