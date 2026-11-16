"use client";

import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectServiceIsBusy } from "@/store/selectors/servicesSelectors";
import { toggleServiceStatus } from "@/store/slices/servicesSlice";
import type { Service } from "@/types/service";

type StatusSwitchProps = {
  service: Service;
};

export function StatusSwitch({ service }: StatusSwitchProps) {
  const dispatch = useAppDispatch();

  const isBusy = useAppSelector((state) =>
    selectServiceIsBusy(state, service.id),
  );

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={service.status === "Active"}
        disabled={isBusy}
        aria-label={`Active status for ${service.name}`}
        aria-busy={isBusy}
        onCheckedChange={() => {
          void dispatch(toggleServiceStatus(service.id));
        }}
      />

      <span className="text-sm" aria-live="polite">
        {service.status}
      </span>
    </div>
  );
}