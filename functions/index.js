/* =============================================================
   PDIN — Cloud Functions
   =============================================================
   Functions:
     1. forwardEnquiry     — student enquiry → instructor email
                             + Firestore instructor_enquiries
                             + Google Sheets instructor tab
     2. onNewApplication   — new join application → support email
                             + Firestore Instructors Profile Details
                             + Google Sheets Application Form tab
     3. onContactForm      — contact message → support email
                             + Google Sheets Contact Form tab
     4. onCallLog          — call tap → Google Sheets instructor tab

   Secrets required (set via firebase functions:secrets:set):
     RESEND_API_KEY              — from resend.com
     GOOGLE_SERVICE_ACCOUNT_JSON — downloaded JSON from GCP service account
     SHEETS_ID                   — Google Sheet ID from the URL
   ============================================================= */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret }      = require('firebase-functions/params');
const { logger }            = require('firebase-functions');
const admin                 = require('firebase-admin');
const { google }            = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

const RESEND_API_KEY              = defineSecret('RESEND_API_KEY');
const GOOGLE_SERVICE_ACCOUNT_JSON = defineSecret('GOOGLE_SERVICE_ACCOUNT_JSON');
const SHEETS_ID                   = defineSecret('SHEETS_ID');

const FROM_EMAIL    = 'PDIN Enquiries <enquiries@pdin.au>';
const SUPPORT_EMAIL = 'support@pdin.au';

/* -------------------------------------------------------------
   SHEETS HELPER
   Appends a row to a named tab. Creates the tab with a header
   row automatically if it doesn't exist yet.
   ------------------------------------------------------------- */
async function appendToSheet(sheetsClient, spreadsheetId, tabName, headers, row) {
  try {
    // Check if the tab already exists
    const meta = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const existingSheet = meta.data.sheets.find(
      s => s.properties.title === tabName
    );

    if (!existingSheet) {
      // Create the tab
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: { properties: { title: tabName } }
          }]
        }
      });
      // Write header row first
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabName}'!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });
      // Insert data at row 2
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabName}'!A2`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
    } else {
      // Tab exists — insert a new row at position 2 (just after header)
      // so the most recent entry is always at the top
      const sheetId = existingSheet.properties.sheetId;
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: 1, // after header row
                endIndex: 2,
              },
              inheritFromBefore: false,
            }
          }]
        }
      });
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabName}'!A2`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
    }
  } catch (err) {
    logger.error(`appendToSheet error for tab "${tabName}":`, err.message || err);
    throw err;
  }
}

/* Build an authorised Sheets client from the service account secret */
function getSheetsClient(serviceAccountJson) {
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

/* Shared date/time stamp in AU format */
function auNow() {
  const now = new Date();
  return now.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

/* -------------------------------------------------------------
   1. FORWARD ENQUIRY
      Trigger: new doc in /enquiries/{enquiryId}
   ------------------------------------------------------------- */
exports.forwardEnquiry = onDocumentCreated(
  {
    document: 'enquiries/{enquiryId}',
    secrets: [RESEND_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON, SHEETS_ID]
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const enquiry    = snap.data();
    const enquiryRef = snap.ref;

    const {
      instructorId, instructorName,
      studentName, studentEmail, studentMobile,
      suburb, licenceStage, transmission,
      preferredDays, preferredTime, message,
    } = enquiry;

    // ── Look up instructor's private email ──
    let instructorEmail = null;
    try {
      const contactDoc = await db.collection('instructor_contacts').doc(instructorId).get();
      instructorEmail = contactDoc.exists ? (contactDoc.data().email || null) : null;
    } catch (err) {
      logger.error('Failed to read instructor_contacts for', instructorId, err);
    }

    // ── Save to instructor-named Firestore subcollection ──
    try {
      const safeName = (instructorName || instructorId).replace(/[\/\\]/g, '-');
      const now = new Date();
      const enquiryDocId = (studentName || 'enquiry').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      await db
        .collection('instructor_enquiries')
        .doc(safeName)
        .collection('enquiries')
        .doc(enquiryDocId)
        .set({
          instructorName,
          studentName:    studentName    || '',
          studentEmail:   studentEmail   || '',
          studentMobile:  studentMobile  || '',
          suburb:         suburb         || '',
          licenceStage:   licenceStage   || '',
          transmission:   transmission   || '',
          preferredDays:  preferredDays  || '',
          preferredTime:  preferredTime  || '',
          message:        message        || '',
          date: now.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', day: '2-digit', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: true }),
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
      logger.error('Failed to save to instructor_enquiries:', err);
    }

    // ── Append to Google Sheets — instructor enquiries tab ──
    try {
      const sheets        = getSheetsClient(GOOGLE_SERVICE_ACCOUNT_JSON.value());
      const spreadsheetId = SHEETS_ID.value();
      const tabName       = (instructorName || instructorId) + ' - Enquiries';
      const headers = [
        'Date', 'Time', 'Type', 'Instructor',
        'Student Name', 'Student Email', 'Student Mobile',
        'Suburb', 'Licence Stage', 'Transmission',
        'Preferred Days', 'Preferred Time', 'Message'
      ];
      const now = new Date();
      const row = [
        now.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', day: '2-digit', month: 'short', year: 'numeric' }),
        now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: true }),
        'Enquiry',
        instructorName || '',
        studentName    || '',
        studentEmail   || '',
        studentMobile  || '',
        suburb         || '',
        licenceStage   || '',
        transmission   || '',
        preferredDays  || '',
        preferredTime  || '',
        message        || '',
      ];
      await appendToSheet(sheets, spreadsheetId, tabName, headers, row);
      logger.info(`Enquiry appended to Sheets tab "${tabName}"`);
    } catch (err) {
      logger.error('Failed to append enquiry to Sheets:', err);
    }

    // ── Email instructor via Resend ──
    const subject  = `PDIN Student Enquiry: ${studentName}`;
    const htmlBody = `
      <p style="font-size:14px;font-weight:bold;margin:0 0 16px 0">Great news — you've received a new enquiry. Please reply promptly, and contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> if you need assistance.</p>
      <p><strong>Instructor:</strong> ${instructorName}</p>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Email:</strong> ${studentEmail}</p>
      <p><strong>Mobile:</strong> ${studentMobile || 'Not provided'}</p>
      <p><strong>Suburb:</strong> ${suburb || 'Not provided'}</p>
      <p><strong>Licence stage:</strong> ${licenceStage || 'Not provided'}</p>
      <p><strong>Transmission:</strong> ${transmission || 'Not specified'}</p>
      <p><strong>Preferred days:</strong> ${preferredDays || 'Not specified'}</p>
      <p><strong>Preferred time:</strong> ${preferredTime || 'Not specified'}</p>
      <p><strong>Message:</strong><br>${(message || '(No message)').replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color:#888;font-size:12px">Just hit reply — it'll go straight to ${studentName} at ${studentEmail}.</p>
    `;

    let instructorSendOk = false;
    let instructorSendError = null;

    if (instructorEmail) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY.value()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [instructorEmail],
            reply_to: studentEmail,
            subject,
            html: htmlBody,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          instructorSendOk = true;
        } else {
          instructorSendError = body.message || `Resend HTTP ${res.status}`;
          logger.error('Resend send failed:', instructorSendError);
        }
      } catch (err) {
        instructorSendError = err.message;
        logger.error('Resend request threw:', err);
      }
    } else {
      instructorSendError = 'No email on file for this instructor';
      logger.warn(`No instructor_contacts email for "${instructorId}" — skipping direct send.`);
    }

    await enquiryRef.update({
      status: instructorSendOk ? 'sent' : 'failed',
      instructorEmailUsed: instructorEmail || null,
      error: instructorSendOk ? null : instructorSendError,
      forwardedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

/* -------------------------------------------------------------
   2. NEW APPLICATION
      Trigger: new doc in /applications/{appId}
   ------------------------------------------------------------- */
exports.onNewApplication = onDocumentCreated(
  {
    document: 'applications/{appId}',
    secrets: [RESEND_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON, SHEETS_ID]
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const app   = snap.data();
    const appId = event.params.appId;

    const name = app.name || app.fullName || '(Unknown)';

    // ── Save copy to Instructors Profile Details ──
    try {
      const profileDocId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + appId.slice(-6);
      await db.collection('instructor_profile_details').doc(profileDocId).set({
        ...app,
        savedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      logger.error('Failed to save to Instructors Profile Details:', err);
    }

    // ── Append to Google Sheets — Application Form tab ──
    try {
      const sheets        = getSheetsClient(GOOGLE_SERVICE_ACCOUNT_JSON.value());
      const spreadsheetId = SHEETS_ID.value();
      const headers = [
        'Date/Time', 'Full Name', 'Email', 'Mobile',
        'Suburb', 'State', 'Experience Since', 'Transmission',
        'Auto Vehicle', 'Manual Vehicle', 'Fee 60min', 'Fee 90min',
        'Availability', 'Languages', 'Teaching Approach', 'Expertise',
        'DIA', 'WWCC', 'Bio'
      ];
      const row = [
        auNow(),
        name,
        app.email        || '',
        app.phone        || '',
        app.suburb       || '',
        app.state        || '',
        app.exp          || '',
        Array.isArray(app.transmission) ? app.transmission.join(', ') : (app.transmission || ''),
        app.vAuto        || '',
        app.vManual      || '',
        app.fee60        || '',
        app.fee90        || '',
        Array.isArray(app.availDays) ? app.availDays.join(', ') : (app.availability || ''),
        Array.isArray(app.languages) ? app.languages.join(', ') : (app.languages || ''),
        Array.isArray(app.teachingApproach) ? app.teachingApproach.join(', ') : '',
        Array.isArray(app.expertise) ? app.expertise.join(', ') : '',
        app.dia          || '',
        app.wwcc         || '',
        app.bio          || app.tagline || '',
      ];
      await appendToSheet(sheets, spreadsheetId, 'Application Form', headers, row);
    } catch (err) {
      logger.error('Failed to append application to Sheets:', err);
    }

    // ── Email support@pdin.au ──
    const subject  = `PDIN New Applicant: ${name}`;
    const htmlBody = `
      <h2 style="color:#1d3557;margin:0 0 20px 0">A new instructor joined PDIN.AU</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${app.email || '(not provided)'}</p>
      <p><strong>Mobile:</strong> ${app.phone || '(not provided)'}</p>
      <p><strong>Suburb:</strong> ${app.suburb || '(not provided)'}</p>
      <p><strong>State:</strong> ${app.state || '(not provided)'}</p>
      <p><strong>Experience since:</strong> ${app.exp || '(not provided)'}</p>
      <p><strong>Transmission:</strong> ${Array.isArray(app.transmission) ? app.transmission.join(', ') : (app.transmission || '(not provided)')}</p>
      <hr>
      <p style="color:#888;font-size:12px">Log in to the admin page to review and approve this application.</p>
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [SUPPORT_EMAIL],
          subject,
          html: htmlBody,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        logger.error('Failed to send new application email:', body.message || res.status);
      }
    } catch (err) {
      logger.error('New application email threw:', err);
    }
  }
);

/* -------------------------------------------------------------
   3. CONTACT FORM
      Trigger: new doc in /contact_form/{docId}
   ------------------------------------------------------------- */
exports.onContactForm = onDocumentCreated(
  {
    document: 'contact_form/{docId}',
    secrets: [RESEND_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON, SHEETS_ID]
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const msg = snap.data();

    const name    = msg.name    || '(Unknown)';
    const email   = msg.email   || '(not provided)';
    const subject = msg.subject || '(none)';
    const message = msg.message || '(No message)';

    // ── Append to Google Sheets — Contact Form tab ──
    try {
      const sheets        = getSheetsClient(GOOGLE_SERVICE_ACCOUNT_JSON.value());
      const spreadsheetId = SHEETS_ID.value();
      const headers = ['Date/Time', 'Name', 'Email', 'Subject', 'Message'];
      const row     = [auNow(), name, email, subject, message];
      await appendToSheet(sheets, spreadsheetId, 'Contact Form', headers, row);
    } catch (err) {
      logger.error('Failed to append contact form to Sheets:', err);
    }

    // ── Email support@pdin.au ──
    const emailSubject = `PDIN Message: ${name}`;
    const htmlBody = `
      <h2 style="color:#1d3557;margin:0 0 20px 0">New Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color:#888;font-size:12px">Reply directly to ${name} at ${email}.</p>
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [SUPPORT_EMAIL],
          reply_to: email,
          subject: emailSubject,
          html: htmlBody,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        logger.error('Failed to send contact form email:', body.message || res.status);
      }
    } catch (err) {
      logger.error('Contact form email threw:', err);
    }
  }
);

/* -------------------------------------------------------------
   4. CALL LOG
      Trigger: new doc in /call_logs/{instructorName}/logs/{logId}
      Appends a call row to the instructor's tab in Google Sheets
   ------------------------------------------------------------- */
exports.onCallLog = onDocumentCreated(
  {
    document: 'call_logs/{instructorName}/logs/{logId}',
    secrets: [GOOGLE_SERVICE_ACCOUNT_JSON, SHEETS_ID]
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const log            = snap.data();
    const instructorName = event.params.instructorName;

    try {
      const sheets        = getSheetsClient(GOOGLE_SERVICE_ACCOUNT_JSON.value());
      const spreadsheetId = SHEETS_ID.value();
      const headers = [
        'Date', 'Time', 'Type', 'Instructor',
        'Suburb', 'Licence Stage'
      ];
      const dateTime = log.date && log.time
        ? { date: log.date, time: log.time }
        : { date: auNow(), time: '' };
      const row = [
        dateTime.date,
        dateTime.time,
        'Call',
        instructorName,
        log.suburb       || '',
        log.licenceStage || '',
      ];
      await appendToSheet(sheets, spreadsheetId, instructorName + ' - Calls', headers, row);
      logger.info(`Call log appended to Sheets tab "${instructorName}"`);
    } catch (err) {
      logger.error('Failed to append call log to Sheets:', err);
    }
  }
);
