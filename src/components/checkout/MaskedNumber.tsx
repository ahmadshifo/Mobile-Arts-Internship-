"use client";

import { useSyncExternalStore } from "react";
import { demoReceipt, readPhone } from "@/lib/checkout/demo";

// The phone changes on the preceding page. Read it when this step mounts.
const subscribe = () => () => {};

export function MaskedNumber() {
 return useSyncExternalStore(subscribe, readPhone, () => demoReceipt.phone);
}
