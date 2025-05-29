import nodemailer from "nodemailer";

// In a real app, these would be environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.example.com";
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "user@example.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "password";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "GOA Erwachsenenbildung <noreply@goa-erwachsenenbildung.de>";

// Create a transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Bestätigen Sie Ihre E-Mail-Adresse",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #047857;">Willkommen bei GOA Erwachsenenbildung!</h2>
        <p>Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
        <p style="margin: 20px 0;">
          <a href="${verificationUrl}" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            E-Mail-Adresse bestätigen
          </a>
        </p>
        <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p>${verificationUrl}</p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Wenn Sie sich nicht bei uns registriert haben, können Sie diese E-Mail ignorieren.</p>
        <p>Mit freundlichen Grüßen,<br>Das GOA Erwachsenenbildung Team</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Passwort zurücksetzen",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #047857;">Passwort zurücksetzen</h2>
        <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Passwort zurücksetzen
          </a>
        </p>
        <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p>${resetUrl}</p>
        <p>Dieser Link ist 1 Stunde gültig.</p>
        <p>Wenn Sie keine Anfrage zum Zurücksetzen Ihres Passworts gestellt haben, können Sie diese E-Mail ignorieren.</p>
        <p>Mit freundlichen Grüßen,<br>Das GOA Erwachsenenbildung Team</p>
      </div>
    `,
  });
}

export async function sendAdminCreatedAccountEmail(
  to: string,
  token: string,
  tempPassword?: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  // Determine if we're sending a temp password or just a reset link
  const usesTempPassword = !!tempPassword;
  const subject = usesTempPassword
    ? "Ihr neues Konto bei GOA Erwachsenenbildung - Temporäres Passwort"
    : "Ihr neues Konto bei GOA Erwachsenenbildung";

  // Build the email with appropriate content based on whether there's a temp password
  const passwordContent = usesTempPassword
    ? `
      <p>Ein Administrator hat ein Konto für Sie erstellt. Hier sind Ihre temporären Anmeldedaten:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0; font-weight: bold;">Temporäres Passwort: ${tempPassword}</p>
      </div>
      <p>Bitte verwenden Sie dieses temporäre Passwort, um sich anzumelden. Bei der ersten Anmeldung werden Sie aufgefordert, Ihr Passwort zu ändern.</p>
      <p>Sie können sich über den folgenden Link anmelden:</p>
      <p style="margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Zum Login
        </a>
      </p>
    `
    : `
      <p>Ein Administrator hat ein Konto für Sie erstellt. Bitte verwenden Sie den folgenden Link, um Ihr Passwort einzurichten:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Passwort einrichten
        </a>
      </p>
      <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
      <p>${resetUrl}</p>
      <p>Dieser Link ist 24 Stunden gültig.</p>
    `;

  // Send email and throw detailed error if it fails
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #047857;">Willkommen bei GOA Erwachsenenbildung!</h2>
          ${passwordContent}
          <p>Falls Sie Fragen haben, kontaktieren Sie uns bitte unter <a href="mailto:support@goa-erwachsenenbildung.de">support@goa-erwachsenenbildung.de</a>.</p>
          <p>Mit freundlichen Grüßen,<br>Das GOA Erwachsenenbildung Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send account creation email to ${to}:`, error);
    throw error; // Re-throw for proper error handling in the API
  }
}

export async function sendContactNotification(contactData: any): Promise<void> {
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: process.env.ADMIN_EMAIL || "admin@example.com",
    subject: "Neue Kontaktanfrage",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #047857;">Neue Kontaktanfrage</h2>
        <p>Es wurde eine neue Kontaktanfrage über das Formular auf der Website eingereicht:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Firma:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.company || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.lastName || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vorname:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.firstName || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>E-Mail:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.email || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Telefon:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.phone || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Dienstleistung:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.service || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nachricht:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              contactData.message || "-"
            }</td>
          </tr>
        </table>
      </div>
    `,
  });
}

export async function sendJobApplicationNotification(
  applicationData: any
): Promise<void> {
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: process.env.ADMIN_EMAIL || "admin@example.com",
    subject: "Neue Bewerbung",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #047857;">Neue Bewerbung</h2>
        <p>Es wurde eine neue Bewerbung über die Website eingereicht:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.lastName || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Vorname:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.firstName || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>E-Mail:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.email || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Telefon:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.phone || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Qualifikationen:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.qualifications?.join(", ") || "-"
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nachricht:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
              applicationData.message || "-"
            }</td>
          </tr>
        </table>
      </div>
    `,
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Check if we're in development mode and email settings are missing
  const isDev = process.env.NODE_ENV === "development";
  const missingEmailConfig =
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD;

  if (isDev && missingEmailConfig) {
    console.log("=== EMAIL SENDING SKIPPED IN DEVELOPMENT ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Content:", html.substring(0, 100) + "...");
    // Return without trying to send the actual email
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
