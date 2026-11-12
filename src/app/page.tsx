import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
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
              <label htmlFor="service-name" className="text-sm font-medium">
                Service name
              </label>

              <Input
                id="service-name"
                placeholder="Enter a service name"
              />
            </div>

            <Button type="button">Create service</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}