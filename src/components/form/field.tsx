"use client";

import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

const controlBase =
  "border-line bg-raised text-ink placeholder:text-faint w-full border px-4 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand-light focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)] disabled:opacity-60";

/** Single-line controls are pills — the radius is half their fixed height. */
const singleLineControl = `${controlBase} rounded-full`;
/**
 * A textarea is free to grow past twice the corner radius, so its corners are
 * real corners and must stay a fixed size rather than follow the pill.
 */
const multiLineControl = `${controlBase} rounded-xl`;

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-muted flex items-center gap-1.5 text-[0.8125rem] font-medium"
      >
        {label}
        {required && (
          <span className="text-brand-light" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p
          className="text-loss flex items-start gap-1.5 text-[0.78125rem]"
          role="alert"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-faint text-[0.78125rem]">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  id,
  ...props
}: ComponentProps<"input"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy = `${inputId}-desc`;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={inputId}
      className={className}
    >
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? describedBy : undefined}
        className={cn(singleLineControl, "h-12", error && "border-loss/70")}
        {...props}
      />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  id,
  children,
  ...props
}: ComponentProps<"select"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}) {
  const generated = useId();
  const selectId = id ?? generated;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={selectId}
      className={className}
    >
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          singleLineControl,
          "h-12 appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10",
          error && "border-loss/70",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23878da8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className,
  id,
  ...props
}: ComponentProps<"textarea"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}) {
  const generated = useId();
  const areaId = id ?? generated;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={areaId}
      className={className}
    >
      <textarea
        id={areaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          multiLineControl,
          "min-h-32 resize-y py-3 leading-relaxed",
          error && "border-loss/70",
        )}
        {...props}
      />
    </Field>
  );
}

export function CheckboxField({
  label,
  error,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { label: ReactNode; error?: string }) {
  const generated = useId();
  const boxId = id ?? generated;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          id={boxId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className={cn(
            "border-line bg-raised accent-brand mt-0.5 size-[18px] shrink-0 cursor-pointer rounded border",
            error && "border-loss/70",
          )}
          {...props}
        />
        <label
          htmlFor={boxId}
          className="text-muted cursor-pointer text-[0.8125rem] leading-relaxed"
        >
          {label}
        </label>
      </div>
      {error && (
        <p
          className="text-loss flex items-start gap-1.5 pl-[30px] text-[0.78125rem]"
          role="alert"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
