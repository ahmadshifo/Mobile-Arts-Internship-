"use client";

import {
 AlertDialog,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CheckoutNote({
 kind,
 lowercase = false,
}: {
 kind: "Terms" | "Privacy";
 lowercase?: boolean;
}) {
 return (
   <AlertDialog>
     <AlertDialogTrigger asChild>
       <button type="button" className="co-link">
         {lowercase ? kind.toLowerCase() : kind}
       </button>
     </AlertDialogTrigger>

     <AlertDialogContent>
       <AlertDialogHeader>
         <AlertDialogTitle>{kind}</AlertDialogTitle>
         <AlertDialogDescription>
           {kind === "Terms"
             ? "Demo offer: one free day, then $0.99 per week. The cancellation keyword is STOP PLAY to 1234. This preview simulates checkout and billing."
             : "This preview keeps a masked number in this browser tab to display your checkout. It sends no phone number to a server."}
         </AlertDialogDescription>
       </AlertDialogHeader>

       <AlertDialogFooter>
         <AlertDialogCancel>Close</AlertDialogCancel>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>
 );
}
