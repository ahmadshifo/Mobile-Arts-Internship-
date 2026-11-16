import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="Create service"
        breadcrumbLabel="New service"
        actions={
          <Button asChild variant="outline">
            <Link href="/services">Cancel</Link>
          </Button>
        }
      />

      <main className="px-4 py-7 sm:px-8">
        <p className="text-muted-foreground">
          The shared service form will be added here.
        </p>
      </main>
    </>
  );
}