"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Pencil } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface EditableChipProps {
  value?: string;
  defaultLabel?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  ariaLabel?: string;
}

const SIZE: Record<
  "sm" | "md" | "lg",
  { h: string; px: string; text: string; btn: string; icon: number }
> = {
  sm: { h: "h-7", px: "px-3", text: "text-xs", btn: "h-5 w-5", icon: 10 },
  md: { h: "h-8", px: "px-3.5", text: "text-sm", btn: "h-6 w-6", icon: 12 },
  lg: { h: "h-10", px: "px-4", text: "text-[15px]", btn: "h-7 w-7", icon: 14 },
};

export function EditableChip({
  value,
  defaultLabel = "Rename",
  onChange,
  placeholder,
  className,
  size = "md",
  disabled = false,
  ariaLabel,
}: EditableChipProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(value ?? defaultLabel);
  const current = isControlled ? (value as string) : internal;

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(current);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isControlled) setDraft(value as string);
  }, [value, isControlled]);

  React.useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing]);

  function startEdit() {
    if (disabled) return;
    setDraft(current);
    setEditing(true);
  }

  function commit() {
    const next = draft.trim();
    if (!next) {
      setEditing(false);
      setDraft(current);
      return;
    }
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
    setDraft(current);
  }

  const s = SIZE[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-gradient-to-br from-surface-2 to-surface-3 transition-all",
        "shadow-[inset_0_0_0_1px_rgba(100,140,255,0.12),0_8px_24px_-20px_rgba(47,123,255,0.6)]",
        editing &&
          "border-accent/50 from-surface to-surface-2 ring-2 ring-accent/30",
        disabled && "opacity-60",
        s.h,
        s.px,
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.input
            key="input"
            ref={inputRef}
            initial={{ opacity: 0, width: 80 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 40 }}
            transition={{ duration: 0.15 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              else if (e.key === "Escape") cancel();
            }}
            onBlur={commit}
            placeholder={placeholder}
            aria-label={ariaLabel ?? "Edit value"}
            disabled={disabled}
            className={cn(
              "min-w-[80px] max-w-[260px] bg-transparent font-medium text-foreground placeholder:text-muted/70 outline-none",
              s.text
            )}
          />
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn("font-medium text-foreground", s.text)}
          >
            {current}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={
          editing
            ? ariaLabel
              ? `Save ${ariaLabel}`
              : "Save"
            : ariaLabel
              ? `Edit ${ariaLabel}`
              : "Edit"
        }
        onMouseDown={(e) => {
          e.preventDefault();
          if (editing) commit();
          else startEdit();
        }}
        disabled={disabled}
        className={cn(
          "inline-flex flex-none items-center justify-center rounded-full border border-transparent text-muted-strong transition-all hover:border-accent/30 hover:bg-accent/10 hover:text-accent-cyan focus-visible:ring-2 focus-visible:ring-accent/40 focus:outline-none",
          s.btn
        )}
      >
        {editing ? <Check size={s.icon} /> : <Pencil size={s.icon - 1} />}
      </button>
    </div>
  );
}
