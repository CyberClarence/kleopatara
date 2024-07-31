"use client";
import * as openpgp from "openpgp";

import { Import } from "lucide-react";
import { useRef, useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";
import KeyImporter from "@/components/KeyImporter";

const TEXTAREA_EXPLAINATORY_TEXT = `write your friend public key here
here is an exemple:
-----BEGIN PGP PUBLIC KEY BLOCK-----
mQGNBGaTvVsBDADZQTd3aWlBH3RmyZCqEL5URrLIBgT8i44F0UsktvoJCxRT7Y9B
TKHcryIoIseTjkJxIoF2nSxC64ytG7b1FlM1bx7dskFOa8ASpjpLZ2o4xPoKDpoz
... you got it !`;

export default function ImportPublicKeyPage() {
  const importPublicKeyToMyStore = useKeyStore((s) => s.importPublicKey);
  const router = useRouter();
  const handleKeyImport = async (keyString: string) => {
    try {
      // * on check d'abord si la clef est valide
      const _isValidKey = await openpgp.readKey({ armoredKey: keyString });

      // * elle est donc valide

      // * on demande le nom de la clef
      const keyName = prompt("give a name to the key please:");

      await importPublicKeyToMyStore(keyName, keyString);

      router.push(`/public/${keyName}`);
    } catch {
      alert("your key is invalid");
    }
  };
  return (
    <KeyImporter
      headingLabel="Import public key"
      textareaPlaceholder={TEXTAREA_EXPLAINATORY_TEXT}
      validateImportButtonLabel="validate & import"
      validateImportHandler={handleKeyImport}
    />
  );
}
