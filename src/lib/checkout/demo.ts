export const countries = [
  { dial: "+961", name: "Lebanon", operator: "Cedar Mobile" },
  { dial: "+965", name: "Kuwait", operator: "Gulf Connect" },
  { dial: "+971", name: "UAE", operator: "Nova Telecom" },
] as const;

export const demoReceipt = {
  phone: "+961 71 ••• 456",
  trialEnd: "12 Nov 2026",
  id: "SUB-20261111-0912",
};

const key = "mobibox.checkout.maskedPhone";
let inMemoryPhone = demoReceipt.phone;

export function rememberPhone(dial: string, digits: string) {
  inMemoryPhone = `${dial} ${digits.slice(0, 2)} ••• ${digits.slice(-3)}`;

  try {
    sessionStorage.setItem(key, inMemoryPhone);
  } catch {
    // The in-memory value still works when browser storage is disabled.
  }
}

export function readPhone() {
  try {
    return sessionStorage.getItem(key) || inMemoryPhone;
  } catch {
    return inMemoryPhone;
  }
}

export function resetPhone() {
  inMemoryPhone = demoReceipt.phone;

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Browser storage is optional for the demo.
  }
}