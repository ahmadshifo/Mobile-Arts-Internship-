import { Check } from "lucide-react";

const labels = ["Mobile number", "Verify code", "Subscribed"];

export function CheckoutSteps({ step }: { step: 1 | 2 | 3 }) {
 return (
   <ol aria-label="Checkout progress" className="co-steps">
     {labels.map((label, index) => (
       <li
         key={label}
         aria-current={index + 1 === step ? "step" : undefined}
         data-reached={index + 1 <= step}
       >
         <span className="co-number" aria-hidden="true">
           {index + 1 < step ? (
             <Check size={15} strokeWidth={3} />
           ) : (
             index + 1
           )}
         </span>
         <span>{label}</span>
       </li>
     ))}
   </ol>
 );
}
