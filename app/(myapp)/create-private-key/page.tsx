"use client";
import * as openpgp from "openpgp";

import { Import } from "lucide-react";
import { useRef, useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";
import KeyImporter from "@/components/KeyImporter";

const TEXTAREA_EXPLAINATORY_TEXT = `write down you private key here
exemple:
-----BEGIN PGP PRIVATE KEY BLOCK-----

lQVYBGaTvVsBDADZQTd3aWlBH3RmyZCqEL5URrLIBgT8i44F0UsktvoJCxRT7Y9B
TKHcryIoIseTjkJxIoF2nSxC64ytG7b1FlM1bx7dskFOa8ASpjpLZ2o4xPoKDpoz
2x/ysZN/nROSXuzFcf82OVEwhigMnZyVME6SgC7NzythE31/1H8dr5yaOtvv5Czw
Z4mkzAFcUJY+8E9XJ44B3gxc28ArzaTR1hOqSoCo8KxNGIGiDchUfFS9r2X1Ld3L
2Q7o38Hls0AaKZFOUx6pm4FB0FXxi4wGKAczVKWyWWtUJ6W7FwKX8/sJJUQIfvx4
....
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
