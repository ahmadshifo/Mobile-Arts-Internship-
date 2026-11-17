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
export async function patchServiceStatus(
  id: number,
  status: Service["status"],
): Promise<Service> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to update status. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function removeService(id: number): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to delete service. Server returned ${response.status}.`,
    );
  }
}
export async function postService(
  data: Omit<Service, "id">,
): Promise<Service> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to create service. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function getServiceById(
  id: number,
  signal?: AbortSignal,
): Promise<Service | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services/${id}`, {
    signal,
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load service. Server returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function putService(
  id: number,
  data: Service,
): Promise<Service> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The API URL is missing. Check .env.local.");
  }

  const response = await fetch(`${apiUrl}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to update service. Server returned ${response.status}.`,
    );
  }

  return response.json();
}