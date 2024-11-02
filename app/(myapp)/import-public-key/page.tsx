"use client";
import * as openpgp from "openpgp";
import { Key, AlertCircle, FileCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";
import KeyImporter from "@/components/KeyImporter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";

const TEXTAREA_EXPLAINATORY_TEXT = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQGNBGaTvVsBDADZQTd3aWlBH3RmyZCqEL5URrLIBgT8i44F0UsktvoJCxRT7Y9B
TKHcryIoIseTjkJxIoF2nSxC64ytG7b1FlM1bx7dskFOa8ASpjpLZ2o4xPoKDpoz...`;

export default function ImportPublicKeyPage() {
  const importPublicKeyToMyStore = useKeyStore((s) => s.importPublicKey);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleKeyImport = async (keyString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const _isValidKey = await openpgp.readKey({ armoredKey: keyString });

      const keyName = prompt("Enter a name for this public key:");
      if (!keyName) {
        setError("Key name is required");
        return;
      }

      const newKey = await importPublicKeyToMyStore(keyName, keyString);
      router.push(`/public/${newKey.id}`);
    } catch (err) {
      setError("Invalid public key format. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative  w-full bg-[#0A192F] text-cyan-50 h-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 h-full">
        <div className="flex flex-col space-y-6 sm:space-y-8 h-full">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/10 shadow-inner">
                <Key className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Import a new Public Key
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <div className="grid gap-6 sm:gap-8 h-full w-full overflow-auto">
            <KeyImporter
              heading={<div className="sr-only">Import Public Key Form</div>}
              textareaPlaceholder={TEXTAREA_EXPLAINATORY_TEXT}
              validateImportButtonLabel={
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span className="hidden sm:inline">Validate &</span> Import
                </span>
              }
              validateImportHandler={handleKeyImport}
            />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-4 sm:p-6 flex flex-col items-center space-y-3 sm:space-y-4 max-w-[90vw] sm:max-w-md">
            <LoadingSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            <p className="text-cyan-300 text-sm sm:text-base text-center">
              Processing public key...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 max-w-[calc(100vw-2rem)] sm:max-w-md bg-red-900/90 text-red-100 p-3 sm:p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm sm:text-base line-clamp-3">{error}</p>
        </div>
      )}

      {/* Dialogs */}
      <Dialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        title="Verify Digital Signature"
      >
        <div className="space-y-4">
          <p className="text-cyan-300 text-sm sm:text-base">
            Paste the signature you want to verify with this public key.
          </p>
          <textarea
            className="w-full h-32 sm:h-40 bg-slate-800 border border-cyan-800/30 rounded-lg p-3 text-cyan-100 text-sm resize-none focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
            placeholder="Paste signature here..."
          />
          <button className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors text-white font-medium">
            Verify Signature
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Public Key"
      >
        <div className="space-y-4">
          <p className="text-red-300 text-sm sm:text-base">
            Are you sure you want to delete this public key? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm sm:text-base font-medium"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm sm:text-base font-medium">
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
