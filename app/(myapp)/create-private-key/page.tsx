"use client";
import * as openpgp from "openpgp";

import { Import } from "lucide-react";
import { useRef, useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";
import KeyImporter from "@/components/KeyImporter";

const TEXTAREA_EXPLAINATORY_TEXT = `write down you private key here
exemple:

`;

export default function ImportNewPrivateKey() {
  const importNewPrivateKeyToMyStore = useKeyStore((s) => s.importPrivateKey);
  const router = useRouter();

  const handleKeyImport = async (keyString: string) => {
    try {
      // * on check d'abord si la clef est valide
      const _isValidKey = await openpgp.readPrivateKey({
        armoredKey: keyString,
      });

      // * elle est donc valide

      // * on demande le nom de la clef
      const keyName = prompt("give a name to your new secret please:");

      await importNewPrivateKeyToMyStore(keyName, keyString);

      router.push(`/private/${keyName}`);
    } catch {
      alert("your key is invalid");
    }
  };

  const generateRandomKeyHandler = async () => {
    const { privateKey, publicKey, revocationCertificate } =
      await openpgp.generateKey({
        type: "rsa",
        rsaBits: 4096,
        userIDs: [{ name: "User", email: "user@kleopatra.app" }],
        format: "armored",
      });
    return privateKey;
  };

  return (
    <KeyImporter
      headingLabel="Import or Create new private key"
      textareaPlaceholder={TEXTAREA_EXPLAINATORY_TEXT}
      validateImportButtonLabel="validate & import"
      validateImportHandler={handleKeyImport}
      generateRandomKeyHandler={generateRandomKeyHandler}
      generateRandomKeyLabel="Generate random private key"
    />
  );
}
