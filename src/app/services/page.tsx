"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { StatusSwitch } from "@/components/services/StatusSwitch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SERVICE_OPERATORS } from "@/lib/constants/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDeleteRequest,
  selectFilteredServices,
  selectHasActiveFilters,
  selectOperator,
  selectSearch,
  selectServiceRequests,
  selectServicesHasLoaded,
  selectServicesRequest,
  selectServicesSummary,
} from "@/store/selectors/servicesSelectors";
import {
  resetFilters,
  setOperator,
  setSearch,
} from "@/store/slices/filtersSlice";
import {
  clearDeleteError,
  deleteService,
  fetchServices,
} from "@/store/slices/servicesSlice";
import type { Service } from "@/types/service";

const serviceTints = [
  "bg-teal-100 text-teal-800",
  "bg-blue-100 text-blue-800",
  "bg-orange-100 text-orange-800",
  "bg-violet-100 text-violet-800",
  "bg-slate-200 text-slate-700",
];

export default function ServicesPage() {
  const dispatch = useAppDispatch();

  const services = useAppSelector(selectFilteredServices);
  const search = useAppSelector(selectSearch);
  const operator = useAppSelector(selectOperator);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);
  const { loading, error } = useAppSelector(selectServicesRequest);
  const hasLoaded = useAppSelector(selectServicesHasLoaded);
  const summary = useAppSelector(selectServicesSummary);
  const requests = useAppSelector(selectServiceRequests);

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  const deleteRequest = useAppSelector((state) =>
    selectDeleteRequest(state, serviceToDelete?.id ?? null),
  );

  const isDeleting = deleteRequest?.loading ?? false;
  const deleteError = deleteRequest?.error;
  const showSkeleton = loading || (!hasLoaded && !error);

  useEffect(() => {
    void dispatch(fetchServices());
  }, [dispatch]);

  function openDeleteDialog(service: Service) {
    dispatch(clearDeleteError(service.id));
    setServiceToDelete(service);
  }

  async function handleDelete() {
    if (!serviceToDelete || isDeleting) {
      return;
    }

    const result = await dispatch(deleteService(serviceToDelete.id));

    if (deleteService.fulfilled.match(result)) {
      setServiceToDelete(null);
    }
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="service-search">Search services</Label>

            <Input
              id="service-search"
              type="search"
              placeholder="Search by name or provider..."
              value={search}
              onChange={(event) =>
                dispatch(setSearch(event.target.value))
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2 sm:w-56">
            <Label htmlFor="operator-filter">Operator</Label>

            <Select
              value={operator}
              onValueChange={(value) =>
                dispatch(setOperator(value as typeof operator))
              }
            >
              <SelectTrigger
                id="operator-filter"
                className="w-full bg-card"
              >
                <SelectValue placeholder="All operators" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All operators</SelectItem>

                {SERVICE_OPERATORS.map((operatorName) => (
                  <SelectItem key={operatorName} value={operatorName}>
                    {operatorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => dispatch(resetFilters())}
            disabled={search === "" && operator === "all"}
          >
            Clear filters
          </Button>
        </div>

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
              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
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
                          <TableCell
                            key={columnIndex}
                            className="px-5 py-5"
                          >
                            <Skeleton className="h-5 w-full min-w-12" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-3 py-6">
                          <p className="font-semibold text-foreground">
                            {hasActiveFilters
                              ? "No matching services"
                              : "No services yet"}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {hasActiveFilters
                              ? "Try another search or clear your filters."
                              : "Create your first service to get started."}
                          </p>

                          {hasActiveFilters ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => dispatch(resetFilters())}
                            >
                              Clear filters
                            </Button>
                          ) : (
                            <Button asChild>
                              <Link href="/services/new">
                                Create service
                              </Link>
                            </Button>
                          )}
                        </div>
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
                          <StatusSwitch service={service} />
                        </TableCell>

                        <TableCell className="px-5">
                          <div className="flex justify-end gap-1">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                            >
                            <Link
                                href={`/services/${service.id}/edit`}
                                aria-label={`Edit ${service.name}`}
                            >
                                    <Pencil className="size-4" aria-hidden="true" />
                                </Link>
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${service.name}`}
                              disabled={
                                Boolean(
                                  requests.deleteService[service.id]
                                    ?.loading,
                                ) ||
                                Boolean(
                                  requests.toggleServiceStatus[
                                    service.id
                                  ]?.loading,
                                )
                              }
                              onClick={() => openDeleteDialog(service)}
                              className="text-muted-foreground hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2
                                className="size-4"
                                aria-hidden="true"
                              />
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

        <AlertDialog
          open={serviceToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setServiceToDelete(null);
            }
          }}
        >
          <AlertDialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              document.getElementById("service-search")?.focus();
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete service?</AlertDialogTitle>

              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-semibold">
                  {serviceToDelete?.name}
                </span>
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteError && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {deleteError}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
              >
                {isDeleting ? "Deleting..." : "Delete service"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}