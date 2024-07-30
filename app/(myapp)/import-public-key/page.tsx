"use client";
import * as openpgp from "openpgp";

import { Import } from "lucide-react";
import { useRef, useState } from "react";
import { useKeyStore } from "@/feature/keystore";
import { useRouter } from "next/navigation";

const TEXTAREA_EXPLAINATORY_TEXT = `write your friend public key here
here is an exemple:
-----BEGIN PGP PUBLIC KEY BLOCK-----
mQGNBGaTvVsBDADZQTd3aWlBH3RmyZCqEL5URrLIBgT8i44F0UsktvoJCxRT7Y9B
TKHcryIoIseTjkJxIoF2nSxC64ytG7b1FlM1bx7dskFOa8ASpjpLZ2o4xPoKDpoz
... you got it !`;

export default function importPublicKeyPage() {
  // * nos refs
  const inputref = useRef<HTMLInputElement>(null);

  // * notre state
  const [keyString, setKeyString] = useState("");

  // * nos handlers
  const handleFileSelection = () => {
    const { current: fileselector } = inputref;
    fileselector.click();
  };

  const handleFileChosen = (files: FileList) => {
    const file = files.item(0);
    let fileReader = new FileReader();
    fileReader.onloadend = () => {
      setKeyString(fileReader.result.toString());
    };
    fileReader.readAsText(file);
  };
  const navigate = useRouter();
  const importPublicKeyToMyStore = useKeyStore(
    (store) => store.importPublicKey
  );
  // * logique custom de cette page
  const handleKeyImport = async () => {
    try {
      // * on check d'abord si la clef est valide
      const _isValidKey = await openpgp.readKey({ armoredKey: keyString });

      // * elle est donc valide

      // * on demande le nom de la clef
      const keyName = prompt("give a name to the key please:");

      await importPublicKeyToMyStore(keyName, keyString);

      navigate.push(`/public/${keyName}`);
    } catch {
      alert("your key is invalid");
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-auto">
      <h2 className=" ml-2 text-2xl underline">Import a public key</h2>
      <div className="h-full w-full flex flex-col border p-8 relative overflow-auto ">
        <div className="bg-blue-900 h-1/2 flex items-center justify-center gap-8 border">
          <div
            className="border rounded p-4 flex items-center gap-6"
            onClick={handleFileSelection}
          >
            <input
              ref={inputref}
              className="hidden"
              type="file"
              onChange={({ currentTarget }) =>
                handleFileChosen(currentTarget.files)
              }
            />
            <div>Import key from disk</div>

            <div>
              <Import className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="bg-red-900 flex h-1/2 items-center justify-center flex flex-col p-2">
          <h3>import from text</h3>
          <div className="flex w-full h-full">
            <textarea
              value={keyString}
              placeholder={TEXTAREA_EXPLAINATORY_TEXT}
              onChange={({ currentTarget }) =>
                setKeyString(currentTarget.value)
              }
              className="w-full h-full overflow-auto flex bg-gray-800 text-green-600"
            />
            <button className="border h-full" onClick={handleKeyImport}>
              {" "}
              validate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
