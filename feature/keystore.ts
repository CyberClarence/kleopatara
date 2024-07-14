import * as openpgp from "openpgp";
import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ArmoredRSAPrivateKey = string;
type ArmoredPublicKey = string;

type KeyStoreData = {
  myPrivateKeys: Map<string, ArmoredRSAPrivateKey>;
  myContactPublicKeys: Map<string, ArmoredPublicKey>;
};

type KeyStoreActions = {
  createNewKey: (keyname: string) => Promise<void>;
  getPublicKey: (name: string) => Promise<string>;
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
    set({
      myPrivateKeys: new Map(get().myPrivateKeys).set(name, privateKey),
    });
  },
  getPublicKey: async (keyname) => {
    const { myPrivateKeys: pgpPrivateKeys } = get();

    const key = pgpPrivateKeys.get(keyname);

    if (!key) return "" as string;

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: key,
    });

    const { armor } = privateKey.toPublic();

    return armor();
  },
  myPrivateKeys: new Map(),
  myContactPublicKeys: new Map(),
});

export const useKeyStore = create(
  persist(immer(keyStore), {
    name: "keystore",
    storage: createJSONStorage(() => localStorage),
  })
);
