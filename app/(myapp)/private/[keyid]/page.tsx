"use client";
import * as openpgp from "openpgp";
import { useKeyStore } from "@/feature/keystore";
import { useEffect, useState } from "react";
import {
  Shield,
  Key,
  FileText,
  Trash2,
  Copy,
  CheckCircle2,
  Lock,
  AlertCircle,
  Pen,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";

export default function PrivateKeyPage({
  params: { keyid },
}: {
  params: { keyid: string };
}) {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [keyname, setKeyname] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [textToSign, setTextToSign] = useState("");
  const [signature, setSignature] = useState("");

  const router = useRouter();
  const deletePrivateKey = useKeyStore((s) => s.deletePrivateKey);

  useEffect(() => {
    const loadKeys = async () => {
      setIsLoading(true);
      try {
        const myKeyStore = useKeyStore.getState();
        const [privateKeyData, publicKeyData] = await Promise.all([
          myKeyStore.getPrivateKeyFromMyPrivateKeys(keyid),
          myKeyStore.getPublicKeyFromMyPrivateKeys(keyid),
        ]);
        setKeyname(privateKeyData.keyname);
        setPrivateKey(privateKeyData.key);
        setPublicKey(publicKeyData.key);
      } catch (err) {
        setError(`Failed to load keys: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadKeys();
  }, [keyid]);

  const handleDecipher = async () => {
    if (!message.trim()) {
      setError("Please enter a message to decipher");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const pgpMessage = await openpgp.readMessage({
        armoredMessage: message,
      });
      const key = await openpgp.readPrivateKey({ armoredKey: privateKey });
      const { data } = await openpgp.decrypt({
        decryptionKeys: key,
        message: pgpMessage,
      });
      setMessage(data.toString());
    } catch (err) {
      setError("Failed to decipher message. (Signed for the wrong key?))");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!textToSign.trim()) {
      setError("Please enter text to sign");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const privateKeyObj = await openpgp.readPrivateKey({
        armoredKey: privateKey,
      });
      const message = await openpgp.createMessage({ text: textToSign });
      const signature = await openpgp.sign({
        message,
        signingKeys: privateKeyObj,
      });
      setSignature(signature.toString());
    } catch (err) {
      setError("Failed to create signature");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPublicKey = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteKey = () => {
    try {
      deletePrivateKey(keyid);
      setShowDeleteDialog(false);
      router.push("/");
    } catch (err) {
      setError("Failed to delete key");
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 md:p-6 h-full w-full overflow-auto space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/10 shadow-inner">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-cyan-50">
            Private Key:{" "}
            <span className="text-cyan-400 break-all">{keyname}</span>
          </h1>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setShowSignDialog(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all text-sm sm:text-base"
          >
            <Pen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Sign Message
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all text-sm sm:text-base"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Delete Key
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-auto gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Public Key Section */}
        <section className="bg-slate-900/50 rounded-xl border border-cyan-800/30 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
              <h3 className="font-medium text-sm sm:text-base">Public Key</h3>
            </div>
            <button
              onClick={handleCopyPublicKey}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs sm:text-sm transition-all"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              {copied ? "Copied!" : "Copy Key"}
            </button>
          </div>
          <textarea
            className="w-full h-[200px] sm:h-[calc(100%-3rem)] resize-none rounded-lg bg-slate-800/50 border border-cyan-800/30 p-3 sm:p-4 text-cyan-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            value={publicKey}
            readOnly
          />
        </section>

        {/* Decipher Message Section */}
        <section className="bg-slate-900/50 rounded-xl border border-cyan-800/30 p-4 sm:p-6">
          <div className="flex items-center space-x-2 text-cyan-400 mb-3 sm:mb-4">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="font-medium text-sm sm:text-base">
              Decipher Message
            </h3>
          </div>
          <div className="relative h-[200px] sm:h-[calc(100%-3rem)]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a ciphered PGP message to decipher..."
              className="w-full h-full resize-none rounded-lg bg-slate-800/50 border border-cyan-800/30 p-3 sm:p-4 text-cyan-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              onClick={handleDecipher}
              disabled={!message.trim()}
              className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Decipher
            </button>
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <Dialog
        isOpen={showSignDialog}
        onClose={() => {
          setShowSignDialog(false);
          setTextToSign("");
          setSignature("");
        }}
        title="Sign Message"
      >
        <div className="space-y-4">
          <textarea
            value={textToSign}
            onChange={(e) => setTextToSign(e.target.value)}
            placeholder="Enter text to sign..."
            className="w-full h-32 bg-slate-800 border border-cyan-800/30 rounded-lg p-3 text-cyan-100"
          />
          {signature && (
            <div className="relative">
              <textarea
                value={signature}
                readOnly
                className="w-full h-32 bg-slate-800 border border-cyan-800/30 rounded-lg p-3 text-cyan-100"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(signature);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute right-2 top-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm transition-all"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
          <button
            onClick={handleSign}
            className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors text-white"
          >
            {signature ? "Renerate Signature" : "Generate Signature"}
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Private Key"
      >
        <div className="space-y-4">
          <p className="text-red-300">
            Warning: Deleting this private key is permanent and cannot be
            undone. Make sure you have a backup if needed.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              onClick={handleDeleteKey}
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-cyan-800/30 rounded-lg p-6 flex flex-col items-center space-y-4">
            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
            <p className="text-cyan-300">Processing...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 text-red-100 p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
}
