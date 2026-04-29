import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function Slideout({ isOpen, onClose, title, children, width = "max-w-2xl" }) {
  const [shouldRender, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setRender(true);
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background overlay */}
        <div 
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div 
            className={`pointer-events-auto w-screen ${width} transform transition duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onTransitionEnd={onAnimationEnd}
          >
            <div className="flex h-full flex-col overflow-y-scroll bg-slate-50 shadow-2xl">
              {/* Header */}
              <div className="bg-white px-4 py-6 sm:px-6 border-b border-slate-100 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800" id="slide-over-title">
                  {title}
                </h2>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="relative flex-1 px-4 py-6 sm:px-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
