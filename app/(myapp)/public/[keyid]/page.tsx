"use client";
import * as openpgp from "openpgp";
import { useKeyStore } from "@/feature/keystore";
import { useEffect, useState } from "react";

export default function PublicKeyPage({
  params: { keyid },
}: {
  params: { keyid: string };
}) {
  const getPublicKey = useKeyStore((store) => store.getPublicKeyFromPublicKeys);

  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const armoredPublicKey = await getPublicKey(keyid);

        setPublicKey(armoredPublicKey);
      } catch {
        setPublicKey("no key found with that id ");
      }
    };
    init();
  }, []);
  const handleCipher = async () => {
    const key = await openpgp.readKey({ armoredKey: publicKey });
    const encryptedMsg = await openpgp.encrypt({
      encryptionKeys: key,
      message: await openpgp.createMessage({ text: message }),
    });
    setMessage(encryptedMsg.toString());
  };

  return (
    <div className="flex flex-col p-4 h-full w-full overflow-auto gap-4">
      <h2 className="underline text-2xl"> clef de {keyid}</h2>
      <div className="p-2 border h-full w-full overflow-auto ">
        <div className="flex h-1/2 w-full flex-col border">
          <h3 className="flex">Clef public</h3>
          <textarea
            className="flex h-full w-full text-white bg-gray-800 border p-2 rounded"
            value={publicKey}
            disabled={true}
          />
        </div>
        <div className="flex w-full h-1/2 flex-col">
          <h2>chiffrement</h2>
          <div className="flex w-full h-full gap-2">
            <textarea
              value={message}
              onChange={(ev) => setMessage(ev.currentTarget.value)}
              className="flex h-full w-full text-white bg-gray-800 border p-2 rounded"
              placeholder="enter your message that you want to cipher"
            />
            <button
              className="bg-red-600 w-fit rounded border"
              onClick={handleCipher}
            >
              Cipher !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
