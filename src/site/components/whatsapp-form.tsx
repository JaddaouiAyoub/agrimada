"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/site/components/icons";

type Labels = {
  name: string;
  subject: string;
  general: string;
  pro: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  errorName: string;
  errorMessage: string;
  greeting: string;
  subjectLabel: string;
  nameLabel: string;
};

/**
 * Formulaire de contact sans serveur : il compose un message et l'ouvre dans WhatsApp
 * (aucune donnée n'est enregistrée sur le site).
 */
export function WhatsAppForm({
  labels,
  products,
  whatsappNumber,
}: {
  labels: Labels;
  /** Noms des produits, proposés comme sujets. */
  products: string[];
  whatsappNumber: string;
}) {
  const [errors, setErrors] = React.useState<{ name?: string; message?: string }>({});

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim().slice(0, 80);
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim().slice(0, 1500);

    const next = { name: name ? undefined : labels.errorName, message: message ? undefined : labels.errorMessage };
    setErrors(next);
    if (next.name || next.message) {
      event.currentTarget.querySelector<HTMLElement>(next.name ? "#wa-name" : "#wa-message")?.focus();
      return;
    }

    const text = [labels.greeting, "", `${labels.nameLabel} : ${name}`, `${labels.subjectLabel} : ${subject}`, "", message].join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const field =
    "w-full rounded-[2px] border border-forest/15 bg-ivory px-4 py-3.5 text-[0.98rem] text-ink outline-none transition-colors placeholder:text-stone/70 focus:border-saffron focus:ring-2 focus:ring-saffron/25";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="wa-name" className="text-sm font-semibold text-forest">
            {labels.name}
          </label>
          <input
            id="wa-name"
            name="name"
            autoComplete="name"
            maxLength={80}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "wa-name-error" : undefined}
            className={cn(field, errors.name && "border-[#b5483f]")}
          />
          {errors.name && (
            <p id="wa-name-error" className="text-sm text-[#b5483f]">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <label htmlFor="wa-subject" className="text-sm font-semibold text-forest">
            {labels.subject}
          </label>
          <select id="wa-subject" name="subject" className={cn(field, "appearance-none")}>
            <option>{labels.general}</option>
            {products.map((p) => (
              <option key={p}>{p}</option>
            ))}
            <option>{labels.pro}</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="wa-message" className="text-sm font-semibold text-forest">
          {labels.message}
        </label>
        <textarea
          id="wa-message"
          name="message"
          rows={5}
          maxLength={1500}
          placeholder={labels.messagePlaceholder}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "wa-message-error" : undefined}
          className={cn(field, "resize-y", errors.message && "border-[#b5483f]")}
        />
        {errors.message && (
          <p id="wa-message-error" className="text-sm text-[#b5483f]">
            {errors.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2.5 rounded-full bg-whatsapp px-7 py-4 font-semibold text-white transition-transform hover:-translate-y-0.5 sm:justify-self-start"
      >
        <WhatsAppIcon className="size-5" />
        {labels.submit}
      </button>
    </form>
  );
}
