"use client";
import * as openpgp from "openpgp";
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ArmoredRSAPrivateKey = string;
type ArmoredPublicKey = string;

type SerialisablePrivateKey = {
  id: string;
  key: ArmoredRSAPrivateKey;
};

type SerialisablePublicKey = {
  id: string;
  key: ArmoredPublicKey;
};

type KeyStoreData = {
  myPrivateKeys: Array<SerialisablePrivateKey>;
  myPublicKeys: Array<SerialisablePublicKey>;
};

type KeyStoreActions = {
  createNewKey: (keyname: string) => Promise<void>;
  importPublicKey: (keyname: string, armoredKeyString: string) => Promise<void>;
  getPublicKeyFromPrivateKeys: (name: string) => Promise<string>;
  getPublicKeyFromPublicKeys: (name: string) => Promise<string>;
};

type KeyStoreInterface = KeyStoreData & KeyStoreActions;

export const keyStore: StateCreator<KeyStoreInterface> = (set, get) => ({
  createNewKey: async (name) => {
    const { privateKey, publicKey, revocationCertificate } =
      await openpgp.generateKey({
        type: "rsa",
        rsaBits: 4096,
        userIDs: [],
        format: "armored",
      });

    const myNewPrivateKey: SerialisablePrivateKey = {
      id: name,
      key: privateKey,
    };
    set({
      myPrivateKeys: [...get().myPrivateKeys, myNewPrivateKey],
    });
  },
  importPublicKey: async (keyname, amoredPublicKeyString) => {
    const key = await openpgp.readKey({ armoredKey: amoredPublicKeyString });
    const { myPublicKeys } = get();

    const alreadyExist = myPublicKeys.find((key) => key.id == keyname);

    if (alreadyExist) throw new Error("this key id is already used");

    const newKey: SerialisablePublicKey = {
      id: keyname,
      key: amoredPublicKeyString,
    };

    set({ myPublicKeys: [...myPublicKeys, newKey] });
  },
  getPublicKeyFromPrivateKeys: async (keyname) => {
    const { myPrivateKeys } = get();

    const key = myPrivateKeys.find((key) => key.id == keyname);

    if (!key) throw new Error("no key found with that id");

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key.key,
    });

    const { armor } = privateKey.toPublic();

    return armor();
  },
  getPublicKeyFromPublicKeys: async (keyname) => {
    const { myPublicKeys } = get();

    const foundKey = myPublicKeys.find((key) => key.id == keyname);

    if (!foundKey) throw new Error("no key found with that id");
    const { key } = foundKey;
    return key;
  },
  myPrivateKeys: [],
  myPublicKeys: [],
});

export const useKeyStore = create<KeyStoreInterface>()(
  persist(keyStore, {
    name: "keystore",
  })
);
