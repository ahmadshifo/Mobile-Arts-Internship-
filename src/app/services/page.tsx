"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices } from "@/store/slices/servicesSlice";
import {
  selectServices,
  selectServicesHasLoaded,
  selectServicesRequest,
  selectServicesSummary,
} from "@/store/selectors/servicesSelectors";

const serviceTints = [
  "bg-teal-100 text-teal-800",
  "bg-blue-100 text-blue-800",
  "bg-orange-100 text-orange-800",
  "bg-violet-100 text-violet-800",
  "bg-slate-200 text-slate-700",
];

export default function ServicesPage() {
  const dispatch = useAppDispatch();

  const services = useAppSelector(selectServices);
  const { loading, error } = useAppSelector(selectServicesRequest);
  const hasLoaded = useAppSelector(selectServicesHasLoaded);
  const summary = useAppSelector(selectServicesSummary);

  useEffect(() => {
    void dispatch(fetchServices());
  }, [dispatch]);

  const showSkeleton = loading || (!hasLoaded && !error);

  return (
    <>
      <PageHeader
        title="Services"
        description="Content services billed through mobile operators"
        actions={
          <Button
            asChild
            className="h-11 rounded-[10px] px-[18px] hover:bg-teal-800"
          >
            <Link href="/services/new">
              <Plus className="size-[18px]" aria-hidden="true" />
              Create service
            </Link>
          </Button>
        }
      />

      <main className="space-y-5 px-4 py-7 sm:px-8">
        {error ? (
          <Card className="border-red-200">
            <CardContent className="space-y-4 p-6">
              <div role="alert">
                <h2 className="font-semibold text-destructive">
                  Unable to load services
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {error}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => void dispatch(fetchServices())}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {showSkeleton ? (
              <Skeleton className="h-5 w-44" />
            ) : (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {summary.total} services · {summary.active} active
              </p>
            )}

            <div
              className="overflow-hidden rounded-[14px] border bg-card"
              aria-busy={showSkeleton}
            >
              {showSkeleton && (
                <p className="sr-only" role="status">
                  Loading services
                </p>
              )}

              <Table className="min-w-[960px]" aria-label="Services">
                <TableHeader className="bg-muted">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5">Service</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Free trial</TableHead>
                    <TableHead className="text-right">
                      Subscribers
                    </TableHead>
                    <TableHead className="pl-5">Status</TableHead>
                    <TableHead className="px-5 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {showSkeleton ? (
                    Array.from({ length: 5 }, (_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 8 }, (_, columnIndex) => (
                          <TableCell key={columnIndex} className="px-5 py-5">
                            <Skeleton className="h-5 w-full min-w-12" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                        <p className="font-semibold">No services yet</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Create your first service to get started.
                        </p>

                        <Button asChild className="mt-4">
                          <Link href="/services/new">Create service</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow
                        key={service.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] font-bold ${
                                serviceTints[
                                  (service.id - 1) % serviceTints.length
                                ]
                              }`}
                            >
                              {service.name.charAt(0).toUpperCase()}
                            </span>

                            <div>
                              <p className="font-semibold">
                                {service.name}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {service.provider}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{service.operator}</TableCell>

                        <TableCell className="font-semibold">
                          ${service.price.toFixed(2)}
                        </TableCell>

                        <TableCell>{service.cycle}</TableCell>

                        <TableCell>
                          {service.trialDays === 0
                            ? "None"
                            : `${service.trialDays} ${
                                service.trialDays === 1 ? "day" : "days"
                              }`}
                        </TableCell>

                        <TableCell className="text-right">
                          {service.subscribers.toLocaleString("en-US")}
                        </TableCell>

                        <TableCell className="pl-5">
                          <Badge
                            variant="secondary"
                            className={
                              service.status === "Active"
                                ? "bg-teal-100 text-teal-800"
                                : "bg-slate-200 text-slate-700"
                            }
                          >
                            {service.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Edit ${service.name}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Delete ${service.name}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
    </>
  );
}