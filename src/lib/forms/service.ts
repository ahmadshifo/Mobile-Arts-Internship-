import {
  serviceSchema,
  type ServiceFormInput,
} from "@/lib/validation/service";

export const serviceDefaultValues: ServiceFormInput = {
  name: "",
  provider: "",
  category: "Games",
  description: "",
  operator: "Cedar Mobile",
  price: 0,
  cycle: "Weekly",
  trialDays: 0,
  keyword: "",
  shortcode: "",
  notificationUrl: "",
  sendWelcomeSms: true,
  status: "Active",
};

const checklistSections: {
  label: string;
  fields: (keyof ServiceFormInput)[];
}[] = [
  {
    label: "Service details",
    fields: ["name", "provider", "category", "description"],
  },
  {
    label: "Operator and pricing",
    fields: ["operator", "price", "cycle", "trialDays"],
  },
  {
    label: "Carrier billing settings",
    fields: [
      "keyword",
      "shortcode",
      "notificationUrl",
      "sendWelcomeSms",
    ],
  },
  {
    label: "Service status",
    fields: ["status"],
  },
];

export function getServiceChecklist(values: ServiceFormInput) {
  return checklistSections.map((section) => ({
    label: section.label,
    complete: section.fields.every(
      (field) =>
        serviceSchema.shape[field].safeParse(values[field]).success,
    ),
  }));
}