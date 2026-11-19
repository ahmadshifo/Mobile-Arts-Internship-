import { getSubscriberById } from "@/lib/api/subscribers";
import { cancellationPatch, type UnsubscribeInput } from "@/lib/api/subscribers/cancellation";
import type { Subscriber } from "@/types/subscriber";

export async function cancelSubscription(
  input: UnsubscribeInput,
  signal?: AbortSignal,
): Promise<Subscriber> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
  const current = await getSubscriberById(input.id, signal);

  if (!current) throw new Error("Subscriber not found.");
  // A previous request may have saved successfully before the response was lost.
  if (current.status === "Unsubscribed") return current;

  const patch = cancellationPatch(current, input);
  const response = await fetch(`${apiUrl}/subscribers/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Couldn’t unsubscribe the number (HTTP ${response.status}). Try again.`);
  }

  return response.json();
}
