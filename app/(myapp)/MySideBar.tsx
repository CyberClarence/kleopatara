"use client";

import { useKeyStore } from "@/feature/keystore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound, Users, Plus, Shield, Loader2, Menu, X } from "lucide-react";

export const MySideBar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const myPrivateKeys = useKeyStore((s) => s.myPrivateKeys);
  const myFriendPublicKeys = useKeyStore((s) => s.myPublicKeys);

  useEffect(() => {
    useKeyStore.persist.rehydrate();
    setIsLoading(false);
  }, []);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-all"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed lg:relative w-[85vw] sm:w-[450px] lg:w-[450px] h-full bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1B2C4F] border-l border-blue-400/10 flex flex-col p-8 gap-8 overflow-auto shadow-[0_0_45px_-15px_rgba(66,153,225,0.4)] transition-transform duration-300 ease-in-out z-40 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link
          className="relative group"
          href={"/"}
          onClick={() => setIsMobileOpen(false)}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:via-cyan-100 group-hover:to-blue-200 transition-all duration-300">
            Kleopatra
          </h1>
          <div className="absolute -bottom-2 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-32 transition-all duration-300" />
        </Link>

        <div className="w-full flex flex-col h-1/2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A192F]/90 to-[#112240] backdrop-blur-xl border border-blue-400/20 shadow-[0_8px_32px_-8px_rgba(66,153,225,0.3)]">
          <div className="flex w-full px-6 py-4 justify-between items-center border-b border-blue-400/20 bg-[#112240]/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-400/15 shadow-inner">
                <Shield className="w-5 h-5 text-blue-200" />
              </div>
              <h2 className="font-semibold text-blue-50/95">Private Keys</h2>
            </div>
            <Link
              href={"/create-private-key"}
              className="p-2 rounded-lg bg-blue-400/15 hover:bg-blue-400/25 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-100" />
            </Link>
          </div>

          {isLoading ? (
            <div className="h-full flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : myPrivateKeys.length ? (
            <div className="flex flex-col p-3 space-y-1">
              {myPrivateKeys.map((key, i) => (
                <Link
                  href={`/private/${key.id}`}
                  key={i}
                  className="px-4 py-3 rounded-xl hover:bg-purple-400/15 text-purple-100/90 text-sm transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.99]"
                >
                  {key.keyname || key.id}
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <p className="text-purple-200/60 text-sm">
                  No private keys yet
                </p>
                <p className="text-purple-300/40 text-xs">
                  Click + to create your first key
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col h-1/2 overflow-hidden rounded-2xl bg-gradient-to-br from-black/90 to-purple-950/30 backdrop-blur-xl border border-purple-500/20 shadow-[0_8px_32px_-8px_rgba(168,85,247,0.25)]">
          <div className="flex w-full px-6 py-4 justify-between items-center border-b border-purple-500/20 bg-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-400/15 shadow-inner">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <h2 className="font-semibold text-purple-50/95">Public Keys</h2>
            </div>
            <Link
              href={"/import-public-key"}
              className="p-2 rounded-lg bg-purple-400/15 hover:bg-purple-400/25 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 text-purple-200" />
            </Link>
          </div>

          {isLoading ? (
            <div className="h-full flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : myFriendPublicKeys.length ? (
            <div className="flex flex-col p-3 space-y-1">
              {myFriendPublicKeys.map((key, i) => (
                <Link
                  href={`/public/${key.id}`}
                  key={i}
                  className="px-4 py-3 rounded-xl hover:bg-purple-400/15 text-purple-100/90 text-sm transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.99]"
                >
                  {key.keyname || key.id}
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-purple-200/60 text-sm">
                Import your first public key
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
