"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";

export default function ServicesPage() {
  const dispatch = useAppDispatch();

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

      <main className="px-4 py-7 sm:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              Notification check
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() =>
                dispatch(
                  addToast({
                    message: "Success notification is working",
                    type: "success",
                  }),
                )
              }
            >
              Test success
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                dispatch(
                  addToast({
                    message: "Error notification is working",
                    type: "error",
                  }),
                )
              }
            >
              Test error
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}