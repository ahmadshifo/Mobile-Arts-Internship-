import type { Subscriber } from "@/types/subscriber";

export const cancellationReasons = [
  "Customer request", "Operator request", "Suspected fraud", "Billing complaint",
] as const;

export type UnsubscribeInput = {
  id: number;
  reason: string;
  refundTransactionId: string | null;
};

function refundId(transactionId: string) {
  return "RF-" + transactionId.replace(/^TX-/, "");
}

export function refundableCharge(subscriber: Subscriber) {
  const charges = subscriber.billingDetails?.charges ?? [];
  const latest = charges
    .filter((c) => c.result === "Charged" || c.result === "Charged (retry)")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!latest || latest.amount <= 0 || latest.amount > subscriber.totalPaid) return null;
  if (charges.some((c) => c.transactionId === refundId(latest.transactionId))) return null;
  return latest;
}

export function cancellationPatch(
  subscriber: Subscriber,
  input: UnsubscribeInput,
  occurredAt = new Date().toISOString(),
): Partial<Subscriber> {
  if (subscriber.status !== "Active") throw new Error("Only active subscriptions can be cancelled.");
  if (!cancellationReasons.some((reason) => reason === input.reason)) {
    throw new Error("Choose a reason before unsubscribing.");
  }
  const charge = input.refundTransactionId === null ? null : refundableCharge(subscriber);
  if (input.refundTransactionId !== null && charge?.transactionId !== input.refundTransactionId) {
    throw new Error("The last charge has changed. Reload the subscriber before refunding.");
  }
  const refundedAmount = charge?.amount ?? 0;
  const patch: Partial<Subscriber> = {
    status: "Unsubscribed",
    cancellation: { reason: input.reason, occurredAt, refundedAmount },
    totalPaid: (Math.round(subscriber.totalPaid * 100) - Math.round(refundedAmount * 100)) / 100,
  };
  const details = subscriber.billingDetails;
  if (details) {
    const charges = [...details.charges];
    if (charge) {
      charges.unshift({
        transactionId: refundId(charge.transactionId),
        date: occurredAt.slice(0, 10),
        amount: -charge.amount,
        result: "Refunded",
      });
    }
    patch.billingDetails = { ...details, nextRenewalOn: null, charges };
  }
  return patch;
}

export function subscriberActivity(subscriber: Subscriber) {
  const history = subscriber.billingDetails?.activity ?? [];
  const cancellation = subscriber.cancellation;
  if (!cancellation) return history;
  const { reason, occurredAt, refundedAmount } = cancellation;
  const events = [{ title: `Unsubscribed by admin · ${reason}`, occurredAt }];
  if (refundedAmount > 0) {
    events.unshift({ title: `Refund of $${refundedAmount.toFixed(2)} issued`, occurredAt });
  }
  return [...events, ...history];
}
