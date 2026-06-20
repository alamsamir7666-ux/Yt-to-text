"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh-Hans", label: "Chinese (Simplified)" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "hi", label: "Hindi" },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  const selected = LANGUAGES.find(l => l.code === value);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-xs text-text-muted hover:text-white hover:border-accent/30 transition-all outline-none">
        <Select.Value>{selected?.label}</Select.Value>
        <ChevronDown size={12} />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-xl z-50">
          <Select.Viewport className="p-1">
            {LANGUAGES.map(lang => (
              <Select.Item
                key={lang.code}
                value={lang.code}
                className="flex items-center px-3 py-2 text-xs text-text-muted hover:text-white hover:bg-bg-card rounded-lg cursor-pointer outline-none data-[highlighted]:bg-bg-card data-[highlighted]:text-white"
              >
                <Select.ItemText>{lang.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
