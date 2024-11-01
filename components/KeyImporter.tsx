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
    <div className="w-full h-full flex flex-col space-y-6 p-4 overflow-auto">
      {props.heading}

      <div className="grid grid-rows-2 gap-6 h-full overflow-auto">
        <section className="bg-slate-900/50 rounded-lg border border-cyan-800/30 p-6 h-full">
          <div className="grid grid-cols-auto grid-flow-col gap-6 h-full overflow-auto">
            {props.generateRandomKeyHandler && (
              <button
                onClick={handleGenerateKey}
                className="group relative flex items-center justify-center p-6 rounded-lg border border-cyan-700/30 bg-slate-800/50 hover:bg-slate-800/70 transition-all"
              >
                <div className="flex flex-col items-center space-y-4">
                  <Dices className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-cyan-100">
                    {props.generateRandomKeyLabel}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={handleFileSelection}
              className="w-full  flex items-center justify-center p-6 rounded-lg border border-cyan-700/30 bg-slate-800/50 hover:bg-slate-800/70 transition-all"
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleFileChosen(e.target.files)
                }
              />
              <div className="flex flex-col items-center space-y-4 w-full ">
                <FileText className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-cyan-100">Import from File</span>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-slate-900/50 rounded-lg border border-cyan-800/30 p-6">
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Import className="w-5 h-5" />
              <span className="text-sm font-medium">Import from Text</span>
            </div>

            <div className="relative flex-1 flex h-full">
              <textarea
                value={keyString}
                placeholder={props.textareaPlaceholder}
                onChange={(e) => setKeyString(e.target.value)}
                className="w-full h-full resize-none rounded-lg bg-slate-800/50 border border-cyan-800/30 p-4 text-cyan-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                onClick={handleKeyImport}
                disabled={!keyString}
                className="absolute right-4 bottom-4 px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {props.validateImportButtonLabel}
              </button>
            </div>
          </div>
        </section>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-6 flex flex-col items-center space-y-4">
            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
            <p className="text-cyan-100">
              Please wait while we are processing your key...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
