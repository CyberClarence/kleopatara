"use client";
import { ReactNode } from "react";
import { MySideBar } from "./MySideBar";

type MyAppLayoutProps = {
  children: ReactNode[];
};

export default function MyAppLayout({ children }: MyAppLayoutProps) {
  return (
    <div className="flex w-full h-full overflow-auto ">
      <MySideBar />
      <div className="flex flex-col overflow-auto h-full w-full">
        {children}
      </div>
    </div>
  );
}
