import { Dices, Import, FileText, Shield } from "lucide-react";
import React, { ReactNode, useRef, useState } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";

type KeyImporterComponentProps = {
  heading: React.ReactNode;
  validateImportButtonLabel: React.ReactNode;
  validateImportHandler: (keyString: string) => Promise<void>;
  textareaPlaceholder: string;
  generateRandomKeyLabel?: string;
  generateRandomKeyHandler?: () => Promise<string>;
};

export default function KeyImporter(props: KeyImporterComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyString, setKeyString] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelection = () => {
    inputRef.current?.click();
  };

  const handleFileChosen = async (files: FileList) => {
    if (!files.length) return;
    setIsLoading(true);
    try {
      const file = files.item(0);
      const text = await file.text();
      setKeyString(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyImport = async () => {
    setIsLoading(true);
    try {
      await props.validateImportHandler(keyString);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!props.generateRandomKeyHandler) return;
    setIsLoading(true);
    try {
      const newKey = await props.generateRandomKeyHandler();
      setKeyString(newKey);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4 sm:space-y-6 p-3 sm:p-4 overflow-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {props.heading}
      </div>

      <div className="grid grid-rows-[auto_1fr] gap-4 sm:gap-6 h-full min-h-0">
        <section className="bg-slate-900/50 rounded-lg border border-cyan-800/30 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-auto sm:grid-flow-col gap-4 sm:gap-6">
            {props.generateRandomKeyHandler && (
              <button
                onClick={handleGenerateKey}
                className="group relative flex items-center justify-center p-4 sm:p-6 rounded-lg border border-cyan-700/30 bg-slate-800/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <Dices className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base text-cyan-100 text-center">
                    {props.generateRandomKeyLabel}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={handleFileSelection}
              className="w-full flex items-center justify-center p-4 sm:p-6 rounded-lg border border-cyan-700/30 bg-slate-800/50 hover:bg-slate-800/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileChosen(e.target.files)
                }
              />
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base text-cyan-100">
                  Import from File
                </span>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-slate-900/50 rounded-lg border border-cyan-800/30 p-4 sm:p-6 min-h-0 ">
          <div className="flex flex-col h-full space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Import className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                Import from Text
              </span>
            </div>

            <div className="relative flex-1 min-h-0">
              <textarea
                value={keyString}
                placeholder={props.textareaPlaceholder}
                onChange={(e) => setKeyString(e.target.value)}
                className="w-full h-full min-h-[200px] resize-none rounded-lg bg-slate-800/50 border border-cyan-800/30 p-3 sm:p-4 text-cyan-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                onClick={handleKeyImport}
                disabled={!keyString}
                className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {props.validateImportButtonLabel}
              </button>
            </div>
          </div>
        </section>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-4 sm:p-6 flex flex-col items-center space-y-3 sm:space-y-4 max-w-[90vw] sm:max-w-md">
            <LoadingSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            <p className="text-cyan-100 text-sm sm:text-base text-center">
              Please wait while we are processing your key...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
