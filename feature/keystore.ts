"use client";
import { randomUUID } from "crypto";
import * as openpgp from "openpgp";
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ArmoredRSAPrivateKey = string;
type ArmoredPublicKey = string;

type SerialisablePrivateKey = {
  id: string;
  keyname?: string
  key: ArmoredRSAPrivateKey;
};

type SerialisablePublicKey = {
  id: string;
  keyname?: string;
  key: ArmoredPublicKey;
};

type KeyStoreData = {
  myPrivateKeys: Array<SerialisablePrivateKey>;
  myPublicKeys: Array<SerialisablePublicKey>;
};

type KeyStoreActions = {
  importPublicKey: (keyname: string, armoredKeyString: string) => Promise<void>;
  importPrivateKey: (
    keyname: string,
    armoredKeyString: string
  ) => Promise<void>;
  getPrivateKeyFromMyPrivateKeys: (name: string) => Promise<string>;
  getPublicKeyFromMyPrivateKeys: (name: string) => Promise<string>;
  getPublicKeyFromMyPublicKeys: (name: string) => Promise<string>;
  deletePrivateKey: (keyname: string) => void;
  deletePublicKey: (keyname: string) => void;
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
      id: randomUUID(),
      keyname: name || "unamed",
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
      id: randomUUID(),
      keyname: keyname || "unamed",
      key: amoredPublicKeyString,
    };

    set({ myPublicKeys: [...myPublicKeys, newKey] });
  },
  importPrivateKey: async (keyname, amoredPublicKeyString) => {
    const key = await openpgp.readKey({ armoredKey: amoredPublicKeyString });
    const { myPrivateKeys } = get();

    const alreadyExist = myPrivateKeys.find((key) => key.id == keyname);

    if (alreadyExist) throw new Error("this key id is already used");

    const newKey: SerialisablePublicKey = {
      id: keyname,
      key: amoredPublicKeyString,
    };

    set({ myPrivateKeys: [...myPrivateKeys, newKey] });
  },
  getPrivateKeyFromMyPrivateKeys: async (keyid) => {
    const { myPrivateKeys } = get();

    const key = myPrivateKeys.find((key) => key.id == keyid);

    if (!key) throw new Error("no key found with that id (" + keyid + ")");

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key.key,
    });

    return key.key.toString();
  },
  getPublicKeyFromMyPrivateKeys: async (keyname) => {
    const { myPrivateKeys } = get();

    const key = myPrivateKeys.find((key) => key.id == keyname);

    if (!key) throw new Error("no key found with that id(" + keyname + ")");

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key.key,
    });
    const publicKey = privateKey.toPublic();

    const publicKeyArmorStringFormat = publicKey.armor();

    return publicKeyArmorStringFormat;
  },
  getPublicKeyFromMyPublicKeys: async (keyname) => {
    const { myPublicKeys } = get();

    const foundKey = myPublicKeys.find((key) => key.id == keyname);

    if (!foundKey) throw new Error("no key found with that id");
    const { key } = foundKey;
    return key;
  },
  deletePrivateKey: (keyname: string) => {
    const { myPrivateKeys } = get();
    const filteredKeys = myPrivateKeys.filter(key => key.id !== keyname);
    set({ myPrivateKeys: filteredKeys });
  },
  deletePublicKey: (keyname: string) => {
    const { myPublicKeys } = get();
    const filteredKeys = myPublicKeys.filter(key => key.id !== keyname);
    set({ myPublicKeys: filteredKeys });
  },
  myPrivateKeys: [],
  myPublicKeys: [],
});

export const useKeyStore = create<KeyStoreInterface>()(
  persist(keyStore, {
    name: "keystore",
  })
);
