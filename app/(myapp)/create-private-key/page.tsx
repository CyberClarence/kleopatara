"use client";
import * as openpgp from "openpgp";
import { Import, Shield, Key, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";
import KeyImporter from "@/components/KeyImporter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
const TEXTAREA_EXPLAINATORY_TEXT = `-----BEGIN PGP PRIVATE KEY BLOCK-----

lQVYBGaTvVsBDADZQTd3aWlBH3RmyZCqEL5URrLIBgT8i44F0UsktvoJCxRT7Y9B
TKHcryIoIseTjkJxIoF2nSxC64ytG7b1FlM1bx7dskFOa8ASpjpLZ2o4xPoKDpoz...`;

export default function ImportNewPrivateKey() {
  const importNewPrivateKeyToMyStore = useKeyStore((s) => s.importPrivateKey);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [pendingKey, setPendingKey] = useState("");

  const handleKeyImport = async (keyString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const _isValidKey = await openpgp.readPrivateKey({
        armoredKey: keyString,
      });
      setPendingKey(keyString);
      setShowNameDialog(true);
    } catch (err) {
      console.error(err);
      setError("Invalid private key format. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!keyName.trim()) {
      setError("Key name is required");
      return;
    }

    setIsLoading(true);
    try {
      const newKey = await importNewPrivateKeyToMyStore(keyName, pendingKey);
      router.push(`/private/${newKey.id}`);
    } catch (err) {
      setError("Failed to import key");
    } finally {
      setIsLoading(false);
      setShowNameDialog(false);
    }
  };

  const generateRandomKeyHandler = async () => {
    setIsLoading(true);
    try {
      const { privateKey } = await openpgp.generateKey({
        type: "rsa",
        rsaBits: 4096,
        userIDs: [{ name: "User", email: "user@kleopatra.app" }],
        format: "armored",
      });
      return privateKey;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full overflow-auto">
      <div className="flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        <KeyImporter
          heading={
            <header className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 shadow-inner">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Create or Import Private Key
              </h1>
            </header>
          }
          textareaPlaceholder={TEXTAREA_EXPLAINATORY_TEXT}
          validateImportButtonLabel={
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Validate & Import
            </span>
          }
          validateImportHandler={handleKeyImport}
          generateRandomKeyHandler={generateRandomKeyHandler}
          generateRandomKeyLabel="Generate New Random Private Key"
        />
      </div>

      <Dialog
        isOpen={showNameDialog}
        onClose={() => setShowNameDialog(false)}
        title="Name Your Private Key"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Key Name
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-cyan-800/30 rounded-lg text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Enter a secure name for your key"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowNameDialog(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNameSubmit}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Import Key
            </button>
          </div>
        </div>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-6 flex flex-col items-center space-y-4 mx-4">
            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
            <p className="text-cyan-300 text-center">
              Processing your private key...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-red-900/90 text-red-100 p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom max-w-md ml-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
