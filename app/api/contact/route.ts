import { NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema, HONEYPOT } from "@/lib/contact";

/**
 * Inquiry form. Validates the submission and emails it to Karen through the
 * Resend HTTP API (plain fetch, no SDK, nothing native on the Worker).
 *
 * Env (Worker secrets in production, .env.local for local testing):
 *   RESEND_API_KEY      Resend API key
 *   CONTACT_TO_EMAIL    inbox for inquiries (frescainteriordesign@gmail.com)
 *   CONTACT_FROM_EMAIL  optional sender on the site's verified domain. Until the
 *                       domain exists, Resend's onboarding sender is used, which
 *                       only delivers to the Resend account owner's own address.
 *
 * Missing config or a failed send returns 502, so the form shows its error
 * message. Only a timestamp and the outcome are logged, never the inquiry.
 */
const ONBOARDING_SENDER = "Fresca website <onboarding@resend.dev>";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Bots fill every field. Pretend it worked and drop it.
  if (typeof body?.[HONEYPOT] === "string" && body[HONEYPOT] !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, fieldErrors: z.flattenError(result.error).fieldErrors }, { status: 400 });
  }

  const sentAt = new Date().toISOString();
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.error(`[contact] ${sentAt} failed: RESEND_API_KEY or CONTACT_TO_EMAIL not set`);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const { name, email, message } = result.data;
  const oneLineName = name.replace(/[\r\n]+/g, " ");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || ONBOARDING_SENDER,
        to: [to],
        reply_to: email,
        subject: `Website inquiry from ${oneLineName}`,
        text: `Name: ${oneLineName}\nEmail: ${email}\nSent: ${sentAt}\n\n${message}\n`,
      }),
    });
    if (!res.ok) {
      console.error(`[contact] ${sentAt} failed: Resend status ${res.status}`);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } catch {
    console.error(`[contact] ${sentAt} failed: network error`);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  console.log(`[contact] ${sentAt} sent`);
  return NextResponse.json({ ok: true });
}
