"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { ServiceForm } from "@/components/services/ServiceForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ServiceFormValues } from "@/lib/validation/service";
import { useAppDispatch } from "@/store/hooks";
import { createService } from "@/store/slices/servicesSlice";
import type { Service } from "@/types/service";

export default function NewServicePage() {
  const dispatch = useAppDispatch();

  const [createdService, setCreatedService] =
    useState<Service | null>(null);

  async function handleCreate(values: ServiceFormValues) {
    const savedService = await dispatch(
      createService(values),
    ).unwrap();

    setCreatedService(savedService);
  }

  return (
    <>
      <PageHeader
        title={createdService ? "Service created" : "Create service"}
        description={
          createdService
            ? "Your service has been saved successfully."
            : "Configure a new service and its carrier billing settings."
        }
        breadcrumbLabel={
          createdService ? "Service created" : "New service"
        }
      />

      <main className="px-4 py-7 sm:px-8">
        {createdService ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="items-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-teal-100">
                <CheckCircle2
                  className="size-9 text-primary"
                  aria-hidden="true"
                />
              </div>

              <CardTitle className="font-heading text-2xl">
                Service created
              </CardTitle>

              <p
                role="status"
                className="text-sm text-muted-foreground"
              >
                {createdService.name} has been saved successfully.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">
                      {createdService.name}
                    </p>

                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {createdService.provider}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className={
                      createdService.status === "Active"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-slate-200 text-slate-700"
                    }
                  >
                    {createdService.status}
                  </Badge>
                </div>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      Operator
                    </dt>
                    <dd className="mt-1 font-medium">
                      {createdService.operator}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground">
                      Price and cycle
                    </dt>
                    <dd className="mt-1 font-medium">
                      ${createdService.price.toFixed(2)} ·{" "}
                      {createdService.cycle}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground">
                      Keyword
                    </dt>
                    <dd className="mt-1 font-medium">
                      {createdService.keyword}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground">
                      Shortcode
                    </dt>
                    <dd className="mt-1 font-medium">
                      {createdService.shortcode}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/services">Back to services</Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatedService(null)}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Create another
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ServiceForm
            mode="create"
            submitLabel="Save service"
            onSubmit={handleCreate}
          />
        )}
      </main>
    </>
  );
}