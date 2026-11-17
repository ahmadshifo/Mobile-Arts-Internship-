"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { ServiceForm } from "@/components/services/ServiceForm";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import type { ServiceFormValues } from "@/lib/validation/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDeleteRequest,
  selectSelectedService,
  selectSelectedServiceFormValues,
  selectServiceDetailsId,
  selectServiceDetailsRequest,
  selectUpdateServiceRequest,
} from "@/store/selectors/servicesSelectors";
import {
  clearDeleteError,
  deleteService,
  fetchServiceById,
  updateService,
} from "@/store/slices/servicesSlice";
import type { Service } from "@/types/service";

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const id = Number(params.id);
  const isValidId = Number.isSafeInteger(id) && id > 0;

  const service = useAppSelector(selectSelectedService);
  const initialValues = useAppSelector(selectSelectedServiceFormValues);
  const detailsId = useAppSelector(selectServiceDetailsId);
  const detailsRequest = useAppSelector(selectServiceDetailsRequest);
  const updateRequest = useAppSelector(selectUpdateServiceRequest);

  const deleteRequest = useAppSelector((state) =>
    selectDeleteRequest(state, isValidId ? id : null),
  );

  const [deleteDialogId, setDeleteDialogId] =
    useState<number | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [deletedService, setDeletedService] =
    useState<Service | null>(null);

  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const deletedHeadingRef = useRef<HTMLHeadingElement>(null);

  const isDeleting = deleteRequest?.loading ?? false;
  const deleteDialogOpen = deleteDialogId === id;
  const hasDeleted = deletedService?.id === id;

  useEffect(() => {
    if (!isValidId) {
      return;
    }

    const request = dispatch(fetchServiceById(id));

    return () => {
      request.abort();
    };
  }, [dispatch, id, isValidId]);

  useEffect(() => {
    if (hasDeleted) {
      deletedHeadingRef.current?.focus();
    }
  }, [hasDeleted]);

  async function handleUpdate(values: ServiceFormValues) {
    setSavedId(null);

    await dispatch(updateService({ id, values })).unwrap();

    setSavedId(id);
  }

  function openDeleteDialog() {
    dispatch(clearDeleteError(id));
    setConfirmation("");
    setDeleteDialogId(id);
  }

  async function handleDelete() {
    if (
      confirmation !== "DELETE" ||
      isDeleting ||
      updateRequest.loading ||
      !service ||
      service.id !== id
    ) {
      return;
    }

    const serviceBeingDeleted = service;
    const result = await dispatch(deleteService(id));

    if (deleteService.fulfilled.match(result)) {
      setDeletedService(serviceBeingDeleted);
      setDeleteDialogId(null);
    }
  }

  if (hasDeleted && deletedService) {
    return (
      <>
        <PageHeader
          title="Service deleted"
          description="The service has been removed."
          breadcrumbLabel="Service deleted"
        />

        <main className="px-4 py-7 sm:px-8">
          <Card className="mx-auto max-w-xl">
            <CardHeader className="items-center gap-3 text-center">
              <CheckCircle2
                className="size-12 text-primary"
                aria-hidden="true"
              />

              <h2
                ref={deletedHeadingRef}
                tabIndex={-1}
                className="font-heading text-2xl font-semibold outline-none"
              >
                Service deleted
              </h2>

              <p className="text-sm text-muted-foreground">
                {deletedService.name} has been deleted successfully.
              </p>
            </CardHeader>

            <CardContent className="flex justify-center">
              <Button asChild>
                <Link href="/services">Back to services</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const isLoading =
    isValidId &&
    (detailsId !== id || detailsRequest.loading);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Edit service"
          description="Loading service details."
          breadcrumbLabel="Edit service"
        />

        <main
          className="space-y-5 px-4 py-7 sm:px-8"
          aria-busy="true"
        >
          <p className="sr-only" role="status">
            Loading service
          </p>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </>
    );
  }

  if (isValidId && detailsRequest.error) {
    return (
      <>
        <PageHeader
          title="Edit service"
          breadcrumbLabel="Edit service"
        />

        <main className="px-4 py-7 sm:px-8">
          <Card className="border-red-200">
            <CardContent className="space-y-4 p-6">
              <div role="alert">
                <h2 className="font-semibold text-destructive">
                  Unable to load service
                </h2>
                <p className="mt-1 text-sm">
                  {detailsRequest.error}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => void dispatch(fetchServiceById(id))}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (
    !isValidId ||
    !service ||
    service.id !== id ||
    !initialValues
  ) {
    return (
      <>
        <PageHeader
          title="Service not found"
          breadcrumbLabel="Not found"
        />

        <main className="px-4 py-7 sm:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Service not found</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This service does not exist or has been deleted.
              </p>

              <Button asChild>
                <Link href="/services">Back to services</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={service.name}
        description="Edit service details and billing settings."
        breadcrumbLabel="Edit service"
        actions={
          <div className="flex items-center gap-3">
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

            <Button
              ref={deleteButtonRef}
              type="button"
              variant="destructive"
              disabled={updateRequest.loading || isDeleting}
              onClick={openDeleteDialog}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete service
            </Button>
          </div>
        }
      />

      <main className="space-y-5 px-4 py-7 sm:px-8">
        {savedId === id && (
          <div
            role="status"
            className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"
          >
            Your last save completed successfully.
          </div>
        )}

        <ServiceForm
          key={service.id}
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleUpdate}
        />

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setDeleteDialogId(null);
            }
          }}
        >
          <AlertDialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();

              if (deletedHeadingRef.current) {
                deletedHeadingRef.current.focus();
              } else {
                deleteButtonRef.current?.focus();
              }
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete service?</AlertDialogTitle>

              <AlertDialogDescription>
                This will permanently delete {service.name}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                Type DELETE to confirm
              </Label>

              <Input
                id="delete-confirmation"
                value={confirmation}
                onChange={(event) =>
                  setConfirmation(event.target.value)
                }
                disabled={isDeleting}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {deleteRequest?.error && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {deleteRequest.error}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={
                  confirmation !== "DELETE" ||
                  isDeleting ||
                  updateRequest.loading
                }
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