"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearch } from "@/store/slices/filtersSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const dispatch = useAppDispatch();

  const search = useAppSelector((state) => state.filters.search);
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-xl bg-sidebar p-6 text-sidebar-foreground">
          <h1 className="font-heading text-2xl font-bold text-white">
            MobiBox Lite
          </h1>
          <p>Services administration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Theme check</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="service-search" className="text-sm font-medium">
                 Search text — Redux check
              </label>

              <Input
                id="service-search"
                placeholder="Type CloudPlay"
                value={search}
                onChange={(event) => dispatch(setSearch(event.target.value))}
              />

              <p className="text-sm text-muted-foreground">
                Stored in Redux: {search || "(empty)"}
              </p>
          </div>

            <Button type="button">Create service</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}