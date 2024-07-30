"use client";

import { useKeyStore } from "@/feature/keystore";
import Link from "next/link";
import { useEffect } from "react";

export const MySideBar = () => {
  const myPrivateKeys = useKeyStore((s) => s.myPrivateKeys);
  const myFriendPublicKeys = useKeyStore((s) => s.myPublicKeys);

  useEffect(() => {
    useKeyStore.persist.rehydrate();

    console.log(Object.keys(myPrivateKeys));
    console.log({ myPrivateKeys });
  }, []);

  return (
    <div className="w-[350px] bg-gray-800 border-l border-l-green flex flex-col p-4 gap-4 overflow-auto">
      <Link className="bold text-4xl " href={"/"}>
        Kleopatra
      </Link>
      <div className="w-full flex flex-col h-1/2 overflow-auto border p-1">
        <div className="flex w-full h-fit border justify-between items-center">
          <h2 className="">My Private Keys</h2>
          <Link
            href={"/create-private-key"}
            className="border w-[17px] h-[18px] flex flex-none items-center justify-center"
          >
            +
          </Link>
        </div>

        {myPrivateKeys.length != 0 ? (
          <div className="flex h-full w-full overflow-auto flex-col">
            {myPrivateKeys.map((key, i) => (
              <Link href={`/private/${key.id}`} key={i}>
                {key.id}
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            please create your first private key{" "}
          </div>
        )}
      </div>
      {/* ---- */}
      <div className="w-full flex flex-col h-1/2 overflow-auto p-1 border">
        <div className="flex w-full h-fit border justify-between items-center">
          <h2 className="">My friend public key</h2>
          <Link
            href={"/import-public-key"}
            className="border w-[17px] h-[18px] flex flex-none items-center justify-center"
          >
            +
          </Link>
        </div>

        {myFriendPublicKeys.length != 0 ? (
          <div className="flex h-full w-full overflow-auto flex-col">
            {myFriendPublicKeys.map((key, i) => (
              <Link href={`/public/${key.id}`} key={i}>
                {key.id}
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            please import your first friend public key
          </div>
        )}
      </div>
    </div>
  );
};
