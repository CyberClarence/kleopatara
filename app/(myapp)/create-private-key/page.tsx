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

  const handleKeyImport = async (keyString: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const _isValidKey = await openpgp.readPrivateKey({
        armoredKey: keyString,
      });

      const keyName = prompt("Enter a secure name for your private key:");
      if (!keyName) {
        setError("Key name is required");
        return;
      }

      const newKey = await importNewPrivateKeyToMyStore(keyName, keyString);
      console.warn({ newKey });
      router.push(`/private/${newKey.id}`);
    } catch (err) {
      console.error(err);
      setError("Invalid private key format. Please check and try again.");
    } finally {
      setIsLoading(false);
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
    <div className="w-full h-full p-6 bg-[#0A192F] text-cyan-50">
      <KeyImporter
        heading={
          <header className="flex items-center space-x-3 mb-8">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
        generateRandomKeyLabel="Generate New Private Key"
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-lg border border-cyan-800/30">
            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
            <p className="mt-2 text-cyan-300">Processing your private key...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 text-red-100 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
}
