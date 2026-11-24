"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { MaskedNumber } from "@/components/checkout/MaskedNumber";
import { Button } from "@/components/ui/button";
import { demoReceipt, resetPhone } from "@/lib/checkout/demo";

export default function SubscribedPage() {
 const [playing, setPlaying] = useState(false);

 const rows = [
   { label: "Service", value: "CloudPlay Games" },
   { label: "Mobile number", value: <MaskedNumber /> },
   { label: "Free trial ends", value: demoReceipt.trialEnd },
   { label: "Then", value: "$0.99 / week" },
   { label: "Subscription ID", value: demoReceipt.id },
 ];

 return (
   <>
     <CheckoutSteps step={3} />

     <div className="co-success">
       <span className="co-done">
         <Check size={34} strokeWidth={2.5} aria-hidden />
       </span>
       <h2>You’re subscribed!</h2>
       <p className="co-description">
         Your free trial has started. We also sent the details by SMS.
       </p>
     </div>

     <dl className="co-receipt">
       {rows.map(({ label, value }) => (
         <div key={label}>
           <dt>{label}</dt>
           <dd>{value}</dd>
         </div>
       ))}
     </dl>

     <Button
       className="co-primary"
       type="button"
       onClick={() => setPlaying(true)}
     >
       Start playing
     </Button>

     {playing && (
       <p className="co-fine" role="status">
         In the real app this opens the CloudPlay Games home page.
       </p>
     )}

     <p className="co-fine">
       To cancel, send <strong>STOP PLAY</strong> to <strong>1234</strong>.{" "}
       <Link
         className="co-link"
         href="/checkout/mobile-number"
         onClick={resetPhone}
       >
         Run the demo again
       </Link>
     </p>
   </>
 );
}
