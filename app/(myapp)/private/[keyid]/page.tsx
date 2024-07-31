"use client";
import * as openpgp from "openpgp";
import { useKeyStore } from "@/feature/keystore";
import { useEffect, useState } from "react";

export default function PrivateKeyPage({
  params: { keyid },
}: {
  params: { keyid: string };
}) {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        setPublicKey("private key is loading ...");
        const armoredPrivateKey = await useKeyStore
          .getState()
          .getPrivateKeyFromMyPrivateKeys(keyid);
        setPublicKey("public key is loading ...");

        const armoredPublicKey = await useKeyStore
          .getState()
          .getPublicKeyFromMyPrivateKeys(keyid);

        setPrivateKey(armoredPrivateKey);
        setPublicKey("private key set");
        setPublicKey(armoredPublicKey);
      } catch {
        setPrivateKey("no key found with that id ");
      }
    };
    init();
  }, [, setPrivateKey]);
  const handleCipher = async () => {
    try {
      var pgpMessage = await openpgp.readMessage({
        armoredMessage: pgpMessage,
      });
    } catch {
      return alert("le message n'est pas du PGP");
    }
    const key = await openpgp.readPrivateKey({ armoredKey: privateKey });
    const encryptedMsg = await openpgp.decrypt({
      decryptionKeys: key,
      message: pgpMessage,
    });
    setMessage(encryptedMsg.toString());
  };

  return (
    <div className="flex flex-col p-4 h-full w-full overflow-auto gap-4">
      <h2 className="underline text-2xl"> clef de {keyid}</h2>
      <div className="p-2 border h-full w-full overflow-auto ">
        <div className="flex h-1/2 w-full flex-col border">
          <h3 className="flex">Public key to share to your friend</h3>
          <textarea
            className="flex h-full w-full text-white bg-gray-800 border p-2 rounded"
            value={privateKey}
            disabled={true}
          />
        </div>
        <div className="flex w-full h-1/2 flex-col">
          <h2>deciphering</h2>
          <div className="flex w-full h-full gap-2">
            <textarea
              value={message}
              onChange={(ev) => setMessage(ev.currentTarget.value)}
              className="flex h-full w-full text-white bg-gray-800 border p-2 rounded"
              placeholder="enter your message that you want to decipher"
            />
            <button
              className="bg-red-600 w-fit rounded border"
              onClick={handleCipher}
            >
              Decipher !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
