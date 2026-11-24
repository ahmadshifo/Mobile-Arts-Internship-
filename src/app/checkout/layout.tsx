import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Gamepad2, LockKeyhole } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CheckoutNote } from "@/components/checkout/CheckoutNote";
import "./checkout.css";

export const metadata: Metadata = {
 title: "CloudPlay Games checkout | MobiBox Lite",
};

const features = [
 "Pay with your mobile bill or prepaid balance",
 "Unlimited access to the full game catalog",
 "Cancel anytime by SMS: send STOP PLAY to 1234",
];

export default function CheckoutLayout({
 children,
}: {
 children: ReactNode;
}) {
 return (
   <div className="co-root">
     <header className="co-bar">
       <div className="co-bar-inner">
         <div className="co-brand">
           <span className="co-game">
             <Gamepad2 size={20} aria-hidden />
           </span>
           CloudPlay Games
         </div>

         <div className="co-secure">
           <LockKeyhole size={14} aria-hidden />
           <span>
             Secure checkout · powered by <strong>MobiBox Lite</strong>
           </span>
         </div>
       </div>
     </header>

     <main className="co-main">
       <section aria-label="About the service" className="co-offer">
         <div className="co-intro">
           <span className="co-trial">1-day free trial</span>
           <h1>Play console-quality games on any screen</h1>
           <p>
             Stream games instantly on your phone, tablet or computer.
             No downloads and no credit card.
           </p>
         </div>

         <ul>
           {features.map((text) => (
             <li key={text}>
               <span>
                 <Check size={14} strokeWidth={3} aria-hidden />
               </span>
               {text}
             </li>
           ))}
         </ul>

         <div className="co-price">
           <span>After the free trial</span>
           <span><strong>$0.99</strong> / week</span>
         </div>
       </section>

       <section aria-label="Checkout" className="min-w-0">
         <Card className="co-card">{children}</Card>
       </section>
     </main>

     <footer className="co-footer">
       <div className="co-bar-inner">
         <p>
           Charges appear on your Cedar Mobile, Gulf Connect or Nova Telecom bill.
         </p>

         <nav aria-label="Checkout footer">
           <CheckoutNote kind="Terms" />
           <CheckoutNote kind="Privacy" />
           <Link href="/services">Back to admin</Link>
         </nav>
       </div>
     </footer>
   </div>
 );
}
