"use client";
import * as openpgp from "openpgp";
import { useKeyStore } from "@/feature/keystore";
import { useEffect, useState } from "react";
import {
  Shield,
  Key,
  FileCheck,
  Trash2,
  AlertCircle,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";

export default function PublicKeyPage({
  params: { keyid },
}: {
  params: { keyid: string };
}) {
  const [publicKey, setPublicKey] = useState("");
  const [keyname, setKeyname] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationText, setVerificationText] = useState("");
  const [signature, setSignature] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const armoredPublicKey = await useKeyStore
          .getState()
          .getPublicKeyFromMyPublicKeys(keyid);
        setPublicKey(armoredPublicKey.key);
        setKeyname(armoredPublicKey.keyname);
      } catch (err) {
        setError("Failed to load public key");
        setPublicKey("");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [keyid]);

  const handleCipher = async () => {
    if (!message.trim()) {
      setError("Please enter a message to decipher");
      return;
    }

    setIsLoading(true);
    try {
      const key = await openpgp.readKey({ armoredKey: publicKey });
      const encryptedMsg = await openpgp.encrypt({
        encryptionKeys: key,
        message: await openpgp.createMessage({ text: message }),
      });
      setMessage(encryptedMsg.toString());
    } catch (err) {
      setError("Ciphering operation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifySignature = async () => {
    if (!signature.trim() || !verificationText.trim()) {
      setError("Please provide both the signature and the text to verify");
      return;
    }

    setIsLoading(true);
    try {
      const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
      const signatureObj = await openpgp.readSignature({
        armoredSignature: signature,
      });
      const message = await openpgp.createMessage({ text: verificationText });

      const verificationResult = await openpgp.verify({
        message,
        signature: signatureObj,
        verificationKeys: publicKeyObj,
      });

      const { verified } = verificationResult.signatures[0];
      await verified;
      setError(null);
      alert("Signature verified successfully!");
    } catch (err) {
      setError("Invalid signature or verification failed");
    } finally {
      setIsLoading(false);
      setShowVerifyDialog(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      const deletePublicKey = useKeyStore.getState().deletePublicKey;
      deletePublicKey(keyid);
      router.push("/");
    } catch (err) {
      setError("Failed to delete key");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 md:p-6 h-full w-full overflow-auto space-y-4 sm:space-y-6 bg-[#0A192F]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 sm:p-3 rounded-xl bg-cyan-500/10 shadow-inner">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-cyan-50 truncate">
            Public Key: <span className="text-cyan-400">{keyname}</span>
          </h1>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setShowVerifyDialog(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all text-sm sm:text-base"
          >
            <FileCheck className="w-4 h-4" />
            <span className="sm:inline">Verify Signature</span>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sm:inline">Delete Key</span>
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
              onClick={handleCopyKey}
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

        {/* Encrypt Message Section */}
        <section className="bg-slate-900/50 rounded-xl border border-cyan-800/30 p-4 sm:p-6">
          <div className="flex items-center space-x-2 text-cyan-400 mb-3 sm:mb-4">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="font-medium text-sm sm:text-base">
              Encrypt Message
            </h3>
          </div>
          <div className="relative h-[200px] sm:h-[calc(100%-3rem)]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to cipher..."
              className="w-full h-full resize-none rounded-lg bg-slate-800/50 border border-cyan-800/30 p-3 sm:p-4 text-cyan-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              onClick={handleCipher}
              disabled={!message.trim()}
              className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Encrypt
            </button>
          </div>
        </section>
      </div>

      {/* Add these dialog components before the closing div */}

      {/* Verify Signature Dialog */}
      <Dialog
        isOpen={showVerifyDialog}
        onClose={() => {
          setShowVerifyDialog(false);
          setVerificationText("");
          setSignature("");
          setError(null);
        }}
        title="Verify Digital Signature"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Original Text
            </label>
            <textarea
              value={verificationText}
              onChange={(e) => setVerificationText(e.target.value)}
              className="w-full h-32 bg-slate-800/50 border border-cyan-800/30 rounded-lg p-3 text-cyan-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Enter the original text..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Signature
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full h-32 bg-slate-800/50 border border-cyan-800/30 rounded-lg p-3 text-cyan-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Paste the PGP signature here..."
            />
          </div>
          <button
            onClick={handleVerifySignature}
            disabled={!signature.trim() || !verificationText.trim()}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            Verify Signature
          </button>
        </div>
      </Dialog>

      {/* Delete Key Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Public Key"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-300">
                Delete Public Key: {keyid}
              </h3>
              <p className="text-sm text-red-200/80 mt-1">
                This action cannot be undone. The key will be permanently
                removed from your keystore.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteKey}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
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
