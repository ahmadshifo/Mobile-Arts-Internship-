import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServiceChecklist } from "@/lib/forms/service";
import type { ServiceFormInput } from "@/lib/validation/service";

type ServicePreviewCardProps = {
  values: ServiceFormInput;
};

export function ServicePreviewCard({
  values,
}: ServicePreviewCardProps) {
  const checklist = getServiceChecklist(values);

  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Live preview
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold">
                {values.name.trim() || "Service name"}
              </h2>

              <p className="mt-1 break-words text-sm text-muted-foreground">
                {values.provider.trim() || "Content provider"}
              </p>
            </div>

            <Badge
              variant="secondary"
              className={
                values.status === "Active"
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-200 text-slate-700"
              }
            >
              {values.status}
            </Badge>
          </div>

          <Badge variant="outline">{values.category}</Badge>

          <p className="break-words text-sm text-muted-foreground">
            {values.description || "Your service description appears here."}
          </p>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {values.operator}
            </p>

            <p className="mt-2 text-2xl font-semibold">
              ${values.price.toFixed(2)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {values.cycle}
              </span>
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {values.trialDays === 0
                ? "No free trial"
                : `${values.trialDays}-day free trial`}
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Keyword</dt>
              <dd className="break-all font-medium">
                {values.keyword || "—"}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shortcode</dt>
              <dd className="break-all font-medium">
                {values.shortcode || "—"}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Welcome SMS</dt>
              <dd>{values.sendWelcomeSms ? "Enabled" : "Disabled"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Completion checklist
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm"
              >
                {item.complete ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}

                <span>{item.label}</span>

                <span className="sr-only">
                  {item.complete ? ": complete" : ": incomplete"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}