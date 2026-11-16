"use client";

import PageHeader from "@/components/layout/PageHeader";
import { ServiceForm } from "@/components/services/ServiceForm";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";

export default function NewServicePage() {
  const dispatch = useAppDispatch();

  function handleValidation() {
    dispatch(
      addToast({
        type: "success",
        message: "Form is valid",
      }),
    );
  }

  return (
    <>
      <PageHeader
        title="Create service"
        description="Configure a new service and its carrier billing settings."
        breadcrumbLabel="New service"
      />

      <main className="px-4 py-7 sm:px-8">
        <ServiceForm
          mode="create"
          submitLabel="Validate service"
          onSubmit={handleValidation}
        />
      </main>
    </>
  );
}