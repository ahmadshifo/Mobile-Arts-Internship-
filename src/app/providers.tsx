"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import { makeStore } from "@/store/store";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      {children}

      <Toaster
        theme="light"
        position="bottom-right"
        richColors
        closeButton
      />
    </Provider>
  );
}