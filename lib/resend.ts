import { Resend } from "resend";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function kirimEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}