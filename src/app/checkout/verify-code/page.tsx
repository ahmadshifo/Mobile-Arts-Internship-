"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { MaskedNumber } from "@/components/checkout/MaskedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyCodePage() {
 const router = useRouter();
 const [code, setCode] = useState("");
 const [error, setError] = useState("");
 const [attempts, setAttempts] = useState(3);
 const [seconds, setSeconds] = useState(0);
 const [resent, setResent] = useState(false);
 const coolingDown = seconds > 0;

 useEffect(() => {
   if (!coolingDown) return;

   const interval = window.setInterval(() => {
     setSeconds((value) => Math.max(0, value - 1));
   }, 1000);

   return () => window.clearInterval(interval);
 }, [coolingDown]);

 function confirmCode(event: FormEvent<HTMLFormElement>) {
   event.preventDefault();

   if (attempts === 0) return;

   if (code.length !== 4) {
     setError("Enter the 4-digit code.");
     return;
   }

   if (code === "1234") {
     router.push("/checkout/subscribed");
     return;
   }

   const remaining = attempts - 1;
   setAttempts(remaining);
   setError(
     `Incorrect code. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} left.`,
   );
 }

 function resend() {
   setCode("");
   setError("");
   setResent(true);
   setSeconds(30);
 }

 return (
   <>
     <CheckoutSteps step={2} />

     <div>
       <h2>Enter the verification code</h2>
       <p className="co-description">
         We sent a 4-digit code to <strong><MaskedNumber /></strong>.{" "}
         <Link className="co-link" href="/checkout/mobile-number">
           Change number
         </Link>
       </p>
     </div>

     {attempts === 0 ? (
       <div className="co-blocked" role="alert">
         <strong>Too many wrong codes</strong>
         <p>
           For your security this attempt was blocked. You can start again
           with your number.
         </p>
         <Link className="co-link" href="/checkout/mobile-number">
           Start again
         </Link>
       </div>
     ) : (
       <form className="co-code-form" onSubmit={confirmCode}>
         <div>
           <label className="co-label" htmlFor="checkout-code">
             Verification code
           </label>

           <Input
             id="checkout-code"
             className="co-input co-code"
             type="text"
             inputMode="numeric"
             autoComplete="one-time-code"
             value={code}
             maxLength={4}
             placeholder="••••"
             aria-invalid={Boolean(error)}
             aria-describedby="checkout-code-hint checkout-code-error"
             onChange={(event) => {
               setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
               setError("");
             }}
           />

           <p className="co-help" id="checkout-code-hint">
             Demo code: 1234
           </p>
           <p className="co-error" id="checkout-code-error" aria-live="polite">
             {error}
           </p>
         </div>

         <Button type="submit" className="co-primary">
           Confirm and subscribe
         </Button>

         <Button
           type="button"
           variant="ghost"
           className="co-resend"
           onClick={resend}
           disabled={coolingDown}
         >
           {coolingDown ? `Resend code in ${seconds}s` : "Resend code"}
         </Button>

         {resent && (
           <p className="co-fine" role="status">
             Demo code resent. Use 1234.
           </p>
         )}
       </form>
     )}
   </>
 );
}
