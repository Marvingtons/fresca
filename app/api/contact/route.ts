import { NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema, HONEYPOT } from "@/lib/contact";

/**
 * Inquiry form. Validates the submission and emails it to Karen through the
 * Resend HTTP API (plain fetch, so nothing native runs on the Worker).
 *
 * Needs three values, set as Worker secrets in production
 * (`npx wrangler secret put <NAME>`) and in .env.local for local testing:
 *   RESEND_API_KEY      Resend API key
 *   CONTACT_TO_EMAIL    the inbox inquiries go to
 *   CONTACT_FROM_EMAIL  sender on a domain verified in Resend, e.g.
 *                       "Fresca website <website@yourdomain.com>"
 *
 * If any is missing, or the send fails, the visitor gets the form's error
 * message (which points them to Karen's email) instead of a false "Thank you".
 * The inquiry itself is never logged.
 */
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

  const { RESEND_API_KEY: key, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = process.env;
  if (!key || !to || !from) {
    console.error("[contact] email is not configured: set RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const { name, email, message } = result.data;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New inquiry from ${name.replace(/[\r\n]+/g, " ")}`,
        text: `${message}\n\n${name}\n${email}`,
      }),
    });
    if (!res.ok) {
      console.error(`[contact] send failed with status ${res.status}`);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } catch {
    console.error("[contact] send failed: network error");
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
