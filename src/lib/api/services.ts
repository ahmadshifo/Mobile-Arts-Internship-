import type { Service } from "@/types/service";

export async function getServices(
  signal?: AbortSignal,
): Promise<Service[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load services. Server returned ${response.status}.`,
    );
  }

  const services: Service[] = await response.json();

  return services;
}