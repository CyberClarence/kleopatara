"use client";
import * as openpgp from "openpgp";
import { useKeyStore } from "@/feature/keystore";
import { useEffect, useState } from "react";

export default function PrivateKeyPage({
  params: { keyid },
}: {
  params: { keyid: string };
}) {
  const [privateKey, setPrivateKey] = useState("loading...");
  const [publicKey, setPublicKey] = useState("loading...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init0 = async () => {
      try {
        const armoredPrivateKey = await useKeyStore
          .getState()
          .getPrivateKeyFromMyPrivateKeys(keyid);

        setPrivateKey(armoredPrivateKey);
      } catch (err) {
        setPrivateKey(`Error: ${err}`);
      }
    };
    const init1 = async () => {
      setPublicKey("loading yes !");
      try {
        const myKeyStore = await useKeyStore.getState();
        const armoredPublicKey = await myKeyStore.getPublicKeyFromMyPrivateKeys(
          keyid
        );
        console.log(armoredPublicKey);

        setPublicKey(armoredPublicKey);
      } catch (err) {
        setPublicKey(`Error: ${err}`);
      }
    };
    init0();
    init1();
  }, []);
  const handleCipher = async () => {
    try {
      var pgpMessage = await openpgp.readMessage({
        armoredMessage: message,
      });
    } catch {
      return alert("le message n'est pas du PGP");
    }
    const key = await openpgp.readPrivateKey({ armoredKey: privateKey });
    const { data } = await openpgp.decrypt({
      decryptionKeys: key,
      message: pgpMessage,
    });

    setMessage(data.toString());
  };

  return (
    <div className="flex flex-col p-4 h-full w-full overflow-auto gap-4">
      <h2 className="underline text-2xl"> clef de {keyid}</h2>
      <div className="p-2 border h-full w-full overflow-auto ">
        <div className="flex h-1/2 w-full flex-col border">
          <h3 className="flex">
            Your public key{" "}
            {
              "(share it to your friend so he can send you chiphered messages than only you can decrypt with this key)"
            }
          </h3>
          <textarea
            className="flex h-full w-full text-white bg-gray-800 border p-2 rounded"
            onChange={() => {
              // tu fais rien ok c'est normal et comme ça on a pas de warning dans la console
            }}
            value={publicKey}
            disabled={false}
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
