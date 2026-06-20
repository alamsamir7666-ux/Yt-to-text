"use client";

import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function TimestampToggle({ value, onChange, disabled }: Props) {
  const toggle = (
    <div className="flex items-center gap-2">
      <Switch.Root
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        className="w-9 h-5 bg-bg-card border border-border rounded-full relative data-[state=checked]:bg-accent data-[state=checked]:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none"
      >
        <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
      </Switch.Root>
      <span className="text-xs text-text-muted">Timestamps</span>
    </div>
  );

  if (disabled) {
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span>{toggle}</span>
          </Tooltip.Trigger>
          <Tooltip.Content
            className="bg-bg-card border border-border text-xs text-text-muted px-2 py-1 rounded-lg"
            sideOffset={4}
          >
            No timestamps available for this video
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return toggle;
}
