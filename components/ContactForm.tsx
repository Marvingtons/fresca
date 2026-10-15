"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contact } from "@/content/site";
import type { ContactField } from "@/lib/contact";
import { HONEYPOT } from "@/lib/honeypot";

type Errors = Partial<Record<ContactField, string>>;
type Status = "idle" | "sending" | "sent" | "error";

const FIELDS: { name: ContactField; type?: string; autoComplete?: string; multiline?: boolean }[] = [
  { name: "name", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "message", multiline: true },
];

// zod is only needed once someone uses the form, so keep it out of the first load.
const loadSchema = () => import("@/lib/contact").then((m) => m.contactSchema);

async function fieldErrors(values: Record<string, unknown>): Promise<Errors> {
  const result = (await loadSchema()).safeParse(values);
  if (result.success) return {};
  const errors: Errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ContactField;
    errors[key] ??= issue.message;
  }
  return errors;
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const values = () => Object.fromEntries(new FormData(formRef.current!)) as Record<string, string>;

  // Inline validation: check a field once it has been visited, and keep it live after that.
  const revalidate = async (field: ContactField, force = false) => {
    if (!force && !touched[field]) return;
    const message = (await fieldErrors(values()))[field];
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = values();
    const found = await fieldErrors(data);
    setTouched({ name: true, email: true, message: true });
    setErrors(found);
    const firstInvalid = FIELDS.find((f) => found[f.name]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("sent");
        return;
      }
      if (json.fieldErrors) {
        const server: Errors = {};
        for (const [k, v] of Object.entries(json.fieldErrors as Record<string, string[]>)) server[k as ContactField] = v?.[0];
        setErrors(server);
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex-[1_1_420px]">
        <p ref={thanksRef} tabIndex={-1} role="status" className="font-serif text-[28px] text-ground outline-none">
          {contact.thanks}
        </p>
      </div>
    );
  }

  const sending = status === "sending";
  const input =
    "w-full border-0 border-b bg-transparent pb-3 pt-2.5 text-ground outline-none transition-colors duration-300 focus:border-ground";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="grid flex-[1_1_420px] content-start gap-3.5" aria-busy={sending}>
      {FIELDS.map((f) => {
        const id = `contact-${f.name}`;
        const error = errors[f.name];
        const props = {
          id,
          name: f.name,
          autoComplete: f.autoComplete,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : undefined,
          onBlur: () => {
            setTouched((t) => ({ ...t, [f.name]: true }));
            revalidate(f.name, true);
          },
          onChange: () => revalidate(f.name),
          onFocus: loadSchema,
          className: `${input} ${error ? "border-error" : "border-ground/30"}`,
        };
        return (
          <div key={f.name}>
            <label htmlFor={id} className="mb-1.5 block text-[11px] uppercase tracking-[.22em] text-on-dark">
              {contact.fields[f.name]}
            </label>
            {f.multiline ? <textarea rows={3} {...props} className={`${props.className} min-h-[90px] resize-y`} /> : <input type={f.type ?? "text"} {...props} />}
            {error && (
              <p id={`${id}-error`} className="mt-1.5 text-[13px] text-error">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={sending} className="pill pill-accent mt-3 cursor-pointer justify-self-start border-0 disabled:cursor-wait disabled:opacity-70">
        {sending ? contact.sending : contact.submit}
      </button>
      {status === "error" && (
        <p role="alert" className="text-[13px] text-error">
          {contact.error}
        </p>
      )}
    </form>
  );
}
