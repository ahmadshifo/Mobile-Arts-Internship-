"use client";

import { useState } from "react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cancellationReasons, refundableCharge } from "@/lib/api/subscribers/cancellation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { unsubscribeSubscriber } from "@/store/subscribersSlice";
import type { Subscriber } from "@/types/subscriber";

export function UnsubscribeDialog({ subscriber }: { subscriber: Subscriber }) {
  const dispatch = useAppDispatch();
  const request = useAppSelector((state) => state.subscribers.unsubscribeRequests[subscriber.id]);
  const busy = request?.loading === true;
  const charge = refundableCharge(subscriber);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(false);
  const [attempted, setAttempted] = useState(false);

  function changeOpen(next: boolean) {
    if (busy) return;
    if (next) {
      setReason("");
      setRefund(false);
      setAttempted(false);
    }
    setOpen(next);
  }

  async function submit() {
    if (busy) return;
    setAttempted(true);
    if (!reason) return;
    const result = await dispatch(unsubscribeSubscriber({
      id: subscriber.id,
      reason,
      refundTransactionId: refund && charge ? charge.transactionId : null,
    }));
    if (unsubscribeSubscriber.fulfilled.match(result)) {
      setOpen(false);
      requestAnimationFrame(() => {
        const destination = document.getElementById("unsubscribe-confirmation")
          ?? document.getElementById("subscriber-detail-heading");
        destination?.focus();
      });
    }
  }

  if (subscriber.status !== "Active") return null;

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Unsubscribe</Button>
      </AlertDialogTrigger>
      <AlertDialogContent onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsubscribe this number?</AlertDialogTitle>
          <AlertDialogDescription>
            {subscriber.maskedPhoneNumber} will stop being charged for {subscriber.serviceName}.
            The mock API simulates the confirmation SMS.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="unsubscribe-reason">Reason</Label>
            <Select value={reason} onValueChange={setReason} disabled={busy}>
              <SelectTrigger id="unsubscribe-reason" className="w-full"
                aria-required="true" aria-invalid={attempted && !reason}
                aria-describedby={attempted && !reason ? "unsubscribe-reason-error" : undefined}>
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {attempted && !reason && (
              <p id="unsubscribe-reason-error" role="alert" className="text-sm text-destructive">
                Choose a reason before unsubscribing.
              </p>
            )}
          </div>

          {charge && (
            <div className="flex items-center gap-2">
              <Checkbox id="refund-last-charge" checked={refund} disabled={busy}
                onCheckedChange={(checked) => setRefund(checked === true)} />
              <Label htmlFor="refund-last-charge">
                Refund the last charge (${charge.amount.toFixed(2)})
              </Label>
            </div>
          )}

          {attempted && request?.error && (
            <p role="alert" className="text-sm text-destructive">{request.error}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={busy}>Keep subscription</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? "Unsubscribing…" : "Unsubscribe"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
