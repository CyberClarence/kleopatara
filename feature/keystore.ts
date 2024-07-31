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
  importPublicKey: (keyname: string, armoredKeyString: string) => Promise<void>;
  importPrivateKey: (
    keyname: string,
    armoredKeyString: string
  ) => Promise<void>;
  getPrivateKeyFromMyPrivateKeys: (name: string) => Promise<string>;
  getPublicKeyFromMyPrivateKeys: (name: string) => Promise<string>;
  getPublicKeyFromMyPublicKeys: (name: string) => Promise<string>;
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
  getPrivateKeyFromMyPrivateKeys: async (keyname) => {
    const { myPrivateKeys } = get();

    const key = myPrivateKeys.find((key) => key.id == keyname);

    alert(JSON.stringify(key));
    if (!key) throw new Error("no key found with that id (" + keyname + ")");

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key.key,
    });

    return key.key;
  },
  getPublicKeyFromMyPrivateKeys: async (keyname) => {
    const { myPrivateKeys } = get();

    const key = myPrivateKeys.find((key) => key.id == keyname);

    if (!key) throw new Error("no key found with that id(" + keyname + ")");

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key.key,
    });

    const { armor } = privateKey.toPublic();

    return armor() || "fuck you myself";
  },
  getPublicKeyFromMyPublicKeys: async (keyname) => {
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
