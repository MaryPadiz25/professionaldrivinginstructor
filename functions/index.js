/* =============================================
   PDIN — Cloud Functions
   1. sendWelcomeEmail      — fires when application status → "approved"
   2. sendProfileUpdatedEmail — fires when a live_profile is updated
   ============================================= */

const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret }      = require('firebase-functions/params');
const { initializeApp }     = require('firebase-admin/app');
const { getFirestore }      = require('firebase-admin/firestore');
const nodemailer            = require('nodemailer');

initializeApp();

/* ── Secrets ── */
const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_PASS = defineSecret('GMAIL_PASS');

/* ── Shared: build a nodemailer transporter ── */
function makeTransporter(user, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const YEAR = new Date().getFullYear();
const FOOTER = `
  <tr>
    <td style="background:#f0f3f7;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#888;">
        &copy; ${YEAR} Professional Driving Instructors Network &nbsp;|&nbsp;
        <a href="https://pdin.au" style="color:#1a3a5c;text-decoration:none;">pdin.au</a>
      </p>
    </td>
  </tr>`;

const HEADER = `
  <tr>
    <td style="background:#1a3a5c;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">
        Professional Driving Instructors Network
      </h1>
    </td>
  </tr>`;

function htmlWrapper(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;
                 overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${HEADER}
          <tr><td style="padding:40px 40px 32px;">${bodyContent}</td></tr>
          ${FOOTER}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* =============================================
   1. sendWelcomeEmail
   Triggers: applications/{appId} status → "approved"
   ============================================= */
exports.sendWelcomeEmail = onDocumentWritten(
  {
    document: 'applications/{appId}',
    secrets:  [GMAIL_USER, GMAIL_PASS],
    region:   'australia-southeast2',
  },
  async (event) => {
    const before = event.data.before?.data();
    const after  = event.data.after?.data();

    if (!after || after.status !== 'approved') return null;
    if (before?.status === 'approved')          return null;

    const firstName = (after.firstName || after.first_name || after.name || 'there').split(' ')[0];
    const toEmail   = after.email;

    if (!toEmail) {
      console.warn('sendWelcomeEmail: no email — skipping.');
      return null;
    }

    const text = `Hi ${firstName},

Congratulations and thank you for joining PDIN!

Your profile has been reviewed, approved, and is now live on the website.

We're excited to have you on the platform and appreciate you being part of the growing PDIN network.

If there's anything you'd like changed or updated on your profile, please don't hesitate to let us know — we're more than happy to help.

If you experience any issues or need support at any time, you can contact us at:

  support@pdin.au

Kind regards,
PDIN Admin / Support Team`;

    const html = htmlWrapper(`
      <p style="margin:0 0 16px;font-size:16px;color:#222;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;font-size:16px;color:#222;">
        <strong>Congratulations and thank you for joining PDIN!</strong>
      </p>
      <p style="margin:0 0 16px;font-size:16px;color:#444;">
        Your profile has been reviewed, approved, and is now <strong>live on the website</strong>.
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#444;">
        We're excited to have you on the platform and appreciate you being part of the growing PDIN network.
      </p>
      <hr style="border:none;border-top:1px solid #e8edf2;margin:0 0 24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#444;">
        If there's anything you'd like changed or updated on your profile, please don't hesitate to let us know — we're more than happy to help.
      </p>
      <p style="margin:0 0 8px;font-size:15px;color:#444;">If you experience any issues or need support at any time, you can contact us at:</p>
      <p style="margin:0 0 24px;font-size:15px;">
        <a href="mailto:support@pdin.au" style="color:#1a3a5c;font-weight:600;">support@pdin.au</a>
      </p>
      <p style="margin:0;font-size:15px;color:#444;">Kind regards,<br><strong>PDIN Admin / Support Team</strong></p>
    `);

    try {
      const info = await makeTransporter(GMAIL_USER.value(), GMAIL_PASS.value())
        .sendMail({ from: `"PDIN Admin" <${GMAIL_USER.value()}>`, to: toEmail,
                    subject: 'Welcome to PDIN – Your Profile is Now Live', text, html });
      console.log(`sendWelcomeEmail: sent to ${toEmail} — ${info.messageId}`);
    } catch (err) {
      console.error('sendWelcomeEmail error:', err);
      throw err;
    }
    return null;
  }
);

/* =============================================
   2. sendProfileUpdatedEmail
   Triggers: live_profiles/{profileId} updated
   Looks up email from instructor_contacts/{profileId}
   ============================================= */
exports.sendProfileUpdatedEmail = onDocumentWritten(
  {
    document: 'live_profiles/{profileId}',
    secrets:  [GMAIL_USER, GMAIL_PASS],
    region:   'australia-southeast2',
  },
  async (event) => {
    const before = event.data.before?.data();
    const after  = event.data.after?.data();

    // Only updates — not creates or deletes
    if (!before || !after)            return null;
    if (!event.data.after?.exists)    return null;

    // Only send if the frontend explicitly set this flag (Save Changes button).
    // Admin Update writes to live_profiles WITHOUT this flag, so no email fires.
    if (!after.notifyInstructor)      return null;

    const profileId = event.params.profileId;

    // Clear the flag immediately so a retry/re-trigger never double-sends
    await getFirestore()
      .collection('live_profiles')
      .doc(profileId)
      .update({ notifyInstructor: false })
      .catch(() => {});

    // Look up email from instructor_contacts using the same doc ID
    const contactSnap = await getFirestore()
      .collection('instructor_contacts')
      .doc(profileId)
      .get();

    if (!contactSnap.exists) {
      console.warn(`sendProfileUpdatedEmail: no contact doc for "${profileId}" — skipping.`);
      return null;
    }

    const toEmail = contactSnap.data().email;
    if (!toEmail) {
      console.warn(`sendProfileUpdatedEmail: empty email for "${profileId}" — skipping.`);
      return null;
    }

    // Derive first name: check profile fields first, then parse the doc ID
    const rawFirst = after.firstName || after.first_name ||
      (after.name ? after.name.split(' ')[0] : null) ||
      profileId.split('-')[0];
    const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1);

    const text = `Hi ${firstName},

Just letting you know that your PDIN profile has now been updated successfully.

The changes you requested are now live on the website.

If you notice anything that doesn't look quite right, or if there's anything else you'd like adjusted, please don't hesitate to get in touch — we're more than happy to help.

  support@pdin.au

Kind regards,
PDIN Admin / Support Team`;

    const html = htmlWrapper(`
      <p style="margin:0 0 16px;font-size:16px;color:#222;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;font-size:16px;color:#444;">
        Just letting you know that your PDIN profile has now been <strong>updated successfully</strong>.
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#444;">
        The changes you requested are now <strong>live on the website</strong>.
      </p>
      <hr style="border:none;border-top:1px solid #e8edf2;margin:0 0 24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#444;">
        If you notice anything that doesn't look quite right, or if there's anything else you'd like adjusted,
        please don't hesitate to get in touch — we're more than happy to help.
      </p>
      <p style="margin:0 0 24px;font-size:15px;">
        <a href="mailto:support@pdin.au" style="color:#1a3a5c;font-weight:600;">support@pdin.au</a>
      </p>
      <p style="margin:0;font-size:15px;color:#444;">Kind regards,<br><strong>PDIN Admin / Support Team</strong></p>
    `);

    try {
      const info = await makeTransporter(GMAIL_USER.value(), GMAIL_PASS.value())
        .sendMail({ from: `"PDIN Admin" <${GMAIL_USER.value()}>`, to: toEmail,
                    subject: 'Your PDIN profile has been updated', text, html });
      console.log(`sendProfileUpdatedEmail: sent to ${toEmail} — ${info.messageId}`);
    } catch (err) {
      console.error('sendProfileUpdatedEmail error:', err);
      throw err;
    }
    return null;
  }
);
