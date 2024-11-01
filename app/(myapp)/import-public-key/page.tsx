"use client";
import * as openpgp from "openpgp";
import { Shield, Key, AlertCircle, FileCheck, Trash2 } from "lucide-react";
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

      await importPublicKeyToMyStore(keyName, keyString);
      router.push(`/public/${keyName}`);
    } catch (err) {
      setError("Invalid public key format. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignature = async () => {
    setShowVerifyDialog(true);
  };

  const handleDeleteKey = async () => {
    setShowDeleteDialog(true);
  };

  return (
    <div className="w-full h-full p-6 bg-[#0A192F] text-cyan-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <header className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Import Public Key
            </h1>
          </header>

          <div className="flex gap-4">
            <button
              onClick={handleVerifySignature}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              Verify Signature
            </button>
            <button
              onClick={handleDeleteKey}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Key
            </button>
          </div>
        </div>

        <KeyImporter
          heading={null}
          textareaPlaceholder={TEXTAREA_EXPLAINATORY_TEXT}
          validateImportButtonLabel={
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Validate & Import
            </span>
          }
          validateImportHandler={handleKeyImport}
        />

        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-6 flex flex-col items-center space-y-4">
              <LoadingSpinner className="w-8 h-8 text-cyan-400" />
              <p className="text-cyan-300">Processing public key...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-900/90 text-red-100 p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Dialog
          isOpen={showVerifyDialog}
          onClose={() => setShowVerifyDialog(false)}
          title="Verify Digital Signature"
        >
          <div className="space-y-4">
            <p className="text-cyan-300">
              Paste the signature you want to verify with this public key.
            </p>
            <textarea
              className="w-full h-32 bg-slate-800 border border-cyan-800/30 rounded-lg p-3 text-cyan-100"
              placeholder="Paste signature here..."
            />
            <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors">
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
            <p className="text-red-300">
              Are you sure you want to delete this public key? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
