"use client";

import { useKeyStore } from "@/feature/keystore";
import Link from "next/link";
import { useEffect } from "react";

export const MySideBar = () => {
  const myPrivateKeys = useKeyStore((store) => store.myPrivateKeys);

  const myFriendPublicKeys = useKeyStore((store) => store.myContactPublicKeys);
  useEffect(() => {
    console.log([...myPrivateKeys.keys()]);
  }, []);

  return (
    <div className="w-[350px] bg-gray-800 border-l border-l-green flex flex-col p-4 overflow-auto">
      <div className="w-full flex flex-col ">
        <h2>My Private Keys</h2>
        <div className="flex flex-col gap-2 min-h-[400px] border border-green-400">
          {/* {myPrivateKeys &&
            [...myPrivateKeys.keys()].map((keyname, i) => (
              <Link href={`/private/${keyname}`} key={i}>
                {keyname}
              </Link>
            ))} */}
        </div>
      </div>
      {/* ---- */}
      <div className="w-full flex flex-col">
        <h2>My Friends Publics Keys</h2>
        <div className="flex flex-col gap-2 min-h-[400px] border border-green-400 ">
          {[...myFriendPublicKeys.keys()]}
        </div>
      </div>
    </div>
  );
};
