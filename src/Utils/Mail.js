// src/utils/mailer.js (ESM) — RTP (ready to paste)
// OutletOps premium + Mailgen templates in one file

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");

/* ─────────────────────────────────────────────
   Premium HTML helpers (reusable shell)
───────────────────────────────────────────── */
const BRAND = {
  name: "OutletOps",
  primary: "#FF6B2B",
  bg: "#F4F5F7",
  ink: "#0F172A",
  muted: "#64748B",
  surface: "#FFFFFF",
  border: "#E6EAF0",
  darkHeaderFrom: "#0B1220",
  darkHeaderTo: "#111B2E",
};

const escapeHtml = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatUrlForDisplay = (url = "") => {
  try {
    const u = new URL(url);
    const out = `${u.host}${u.pathname}`;
    return out.length > 64 ? out.slice(0, 64) + "…" : out;
  } catch {
    return url;
  }
};

const renderPill = (text) => `
  <span style="display:inline-block;background:#FFF4EF;color:${BRAND.primary};font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid #FFD5C0;letter-spacing:.2px;">
    ${escapeHtml(text)}
  </span>
`;

const renderDivider = () =>
  `<div style="height:1px;background:${BRAND.border};margin:18px 0;"></div>`;

const renderButton = ({ href, label }) => `
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
    href="${href}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="12%" stroke="f" fillcolor="${BRAND.primary}">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:Segoe UI, Arial, sans-serif;font-size:16px;font-weight:700;">
      ${escapeHtml(label)}
    </center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <a href="${href}"
    style="display:inline-block;background:${BRAND.primary};color:#ffffff;font-size:16px;font-weight:800;line-height:48px;text-align:center;
      text-decoration:none;border-radius:10px;padding:0 26px;letter-spacing:.2px;-webkit-text-size-adjust:none;">
    ${escapeHtml(label)}
  </a>
  <!--<![endif]-->
`;

const renderEmailShell = ({
  title,
  preheader,
  heading,
  bodyHtml,
  footerNote,
  year = new Date().getFullYear(),
  supportEmail = "support@outletops.com",
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(title || BRAND.name)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Segoe UI, Arial, sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader || "")}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:36px 0;">
    <tr>
      <td align="center" style="padding:0 12px;">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0"
          style="width:620px;max-width:100%;background:${BRAND.surface};border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.10);border:1px solid ${BRAND.border};">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.darkHeaderFrom} 0%,${BRAND.darkHeaderTo} 100%);padding:30px 34px;text-align:left;">
              <div style="font-size:22px;font-weight:900;color:${BRAND.primary};letter-spacing:1.6px;">OUTLETOPS</div>
              <div style="font-size:12px;color:#9CA3AF;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Business Suite</div>
            </td>
          </tr>

          <tr>
            <td style="padding:34px;">
              <div style="color:${BRAND.ink};font-size:20px;font-weight:900;line-height:1.2;margin:0 0 10px;">
                ${escapeHtml(heading || "")}
              </div>
              ${bodyHtml || ""}
            </td>
          </tr>

          <tr>
            <td style="background:#F8FAFC;padding:22px 34px;border-top:1px solid ${BRAND.border};text-align:left;">
              <div style="font-size:12px;color:#94A3B8;line-height:1.6;">
                ${footerNote ? escapeHtml(footerNote) : `Need help? Contact us at ${supportEmail}.`}
              </div>
              <div style="font-size:12px;color:#94A3B8;line-height:1.6;margin-top:8px;">
                &copy; ${year} ${escapeHtml(BRAND.name)}. All rights reserved.
              </div>
            </td>
          </tr>
        </table>

        <div style="height:14px;"></div>

        <div style="max-width:620px;font-size:11px;color:#94A3B8;line-height:1.6;text-align:center;">
          Please do not forward this email. Links may contain personal tokens.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ─────────────────────────────────────────────
   Core email sender
───────────────────────────────────────────── */
export const sendEmail = async (options) => {
  let emailHtml;
  let emailTextual;

  if (options.customHtml) {
    // ✅ Custom HTML template — skip mailgen entirely
    emailHtml = options.customHtml;
    emailTextual = "Please view this email in an HTML-compatible email client.";
  } else {
    // ✅ Mailgen content object
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "OutletOps",
        link: process.env.FRONTEND_URL || "https://outletops.com",
      },
    });
    emailHtml = mailGenerator.generate(options.mailgenContent);
    emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"OutletOps" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  });
};

/* ─────────────────────────────────────────────
   Mailgen templates (plaintext + fallback HTML)
───────────────────────────────────────────── */

// 1) Email Verification (Mailgen)
export const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro: [
      "Welcome to OutletOps — your all-in-one business management suite.",
      "Please verify your email to get started.",
    ],
    action: {
      instructions: "Click the button below to verify your email address:",
      button: {
        color: BRAND.primary,
        text: "Verify Email Address",
        link: verificationUrl,
      },
    },
    outro:
      "If you didn't create an OutletOps account, you can safely ignore this email.",
  },
});

// 2) Forgot Password (Mailgen)
export const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
  body: {
    name: username,
    intro: [
      "We received a request to reset the password for your OutletOps account.",
      "This link will expire in 1 hour.",
    ],
    action: {
      instructions: "Click the button below to choose a new password:",
      button: {
        color: BRAND.primary,
        text: "Reset My Password",
        link: passwordResetUrl,
      },
    },
    outro:
      "If you didn't request a password reset, please ignore this email. Your password will remain unchanged.",
  },
});

// 3) Invoice / Subscription Payment Due (Mailgen)
export const invoiceMailgenContent = ({
  orgName,
  invoiceId,
  amount,
  currency = "USD",
  dueDate,
  notes,
  paymentLink,
}) => {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return {
    body: {
      name: orgName,
      intro: [
        "A subscription invoice has been generated for your OutletOps account.",
        "Please complete payment before the due date to ensure uninterrupted access.",
      ],
      table: {
        data: [
          {
            Item: "OutletOps — Business Suite Subscription",
            Amount: formattedAmount,
          },
        ],
        columns: { customAlignment: { Amount: "right" } },
      },
      dictionary: [
        { "Invoice ID": invoiceId },
        { "Due Date": formattedDueDate },
        { "Billed To": orgName },
        ...(notes ? [{ Notes: notes }] : []),
      ],
      ...(paymentLink && {
        action: {
          instructions: "Click the button below to complete your payment:",
          button: {
            color: BRAND.primary,
            text: "Pay Now",
            link: paymentLink,
          },
        },
      }),
      outro: [
        "If you have already made this payment, please disregard this email.",
        "For billing support, contact billing@outletops.com",
      ],
    },
  };
};

// 4) Salary Slip (Mailgen)
export const salarySlipMailgenContent = ({
  employeeName,
  month,
  year,
  netSalary,
  currency = "USD",
  paymentDate,
  viewLink,
}) => {
  const formattedSalary = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(netSalary);

  return {
    body: {
      name: employeeName,
      intro: [
        `Your salary slip for ${month} ${year} is now available.`,
        "Please find the details below.",
      ],
      dictionary: [
        { "Pay Period": `${month} ${year}` },
        { "Net Salary": formattedSalary },
        { "Payment Date": paymentDate || "N/A" },
      ],
      ...(viewLink && {
        action: {
          instructions:
            "Click below to view and download your full salary slip:",
          button: {
            color: BRAND.primary,
            text: "View Salary Slip",
            link: viewLink,
          },
        },
      }),
      outro:
        "For any payroll queries, please contact your HR department or reply to this email.",
    },
  };
};

// 5) Leave Status (Mailgen)
export const leaveStatusMailgenContent = ({
  employeeName,
  leaveType,
  fromDate,
  toDate,
  status,
  reason,
  approverName,
}) => {
  const isApproved = status?.toLowerCase() === "approved";

  return {
    body: {
      name: employeeName,
      intro: [`Your leave request has been ${status?.toUpperCase()}.`],
      dictionary: [
        { "Leave Type": leaveType },
        { From: fromDate },
        { To: toDate },
        { Status: status?.toUpperCase() },
        { "Reviewed By": approverName || "HR Manager" },
        ...(reason ? [{ Remarks: reason }] : []),
      ],
      outro: isApproved
        ? "Enjoy your time off! Your team has been notified."
        : "If you have questions about this decision, please contact your HR manager.",
    },
  };
};

// 6) Staff Welcome (Mailgen)
export const staffWelcomeMailgenContent = ({
  staffName,
  outletName,
  role,
  loginEmail,
  temporaryPassword,
  loginUrl,
}) => ({
  body: {
    name: staffName,
    intro: [
      `Welcome to ${outletName}! Your OutletOps staff account has been created.`,
      "You can now access the tools assigned to your role.",
    ],
    dictionary: [
      { "Your Role": role },
      { "Login Email": loginEmail },
      { "Temporary Password": temporaryPassword },
      { Outlet: outletName },
    ],
    action: {
      instructions:
        "Log in using the credentials above and change your password immediately:",
      button: {
        color: BRAND.primary,
        text: "Login to OutletOps",
        link: loginUrl || process.env.FRONTEND_URL || "https://outletops.com",
      },
    },
    outro:
      "For security, your temporary password expires in 24 hours. If you need help, contact your manager or support@outletops.com",
  },
});

/* ─────────────────────────────────────────────
   Premium HTML templates (best UI)
───────────────────────────────────────────── */

// A) Email Verification (Premium HTML)
export function emailVerificationMailContent(username, verificationUrl) {
  const safeName = escapeHtml(username || "there");
  const safeUrl = verificationUrl || "#";

  const bodyHtml = `
    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 14px;">
      Hi <strong style="color:${BRAND.ink};">${safeName}</strong>,<br/>
      Confirm your email to activate your <strong style="color:${BRAND.ink};">OutletOps</strong> account.
    </div>

    <div style="background:#FFF7F2;border:1px solid #FFD5C0;border-radius:14px;padding:14px 16px;margin:14px 0 18px;">
      <div style="font-size:12px;color:${BRAND.muted};margin-bottom:6px;font-weight:700;letter-spacing:.3px;">
        What you’ll unlock
      </div>
      <div>
        ${["POS", "HRM", "Payroll", "Attendance", "Staff Management"].map(renderPill).join("&nbsp;")}
      </div>
    </div>

    <div style="text-align:center;margin:20px 0 18px;">
      ${renderButton({ href: safeUrl, label: "Verify Email" })}
    </div>

    <div style="color:${BRAND.muted};font-size:13px;line-height:1.75;margin:0;">
      This link expires soon for security. If you didn’t create an account, you can ignore this email.
      ${renderDivider()}
      <div style="font-size:12px;color:#94A3B8;">
        Having trouble with the button? Copy and paste this link:<br/>
        <a href="${safeUrl}" style="color:${BRAND.primary};text-decoration:none;word-break:break-all;">${escapeHtml(
          safeUrl,
        )}</a><br/>
        <span style="color:#94A3B8;">(${escapeHtml(formatUrlForDisplay(safeUrl))})</span>
      </div>
    </div>
  `;

  return renderEmailShell({
    title: "Verify your OutletOps account",
    preheader: "Verify your email to activate your OutletOps account.",
    heading: "Verify your email",
    bodyHtml,
    footerNote:
      "You received this email because you created an OutletOps account.",
  });
}

// B) Workspace / Outlet Invite (Premium HTML)
export const getInviteEmailTemplate = ({
  recipientName = "there",
  workspaceName,
  inviteLink,
  role = "Team Member",
  supportEmail = "support@outletops.com",
  year = new Date().getFullYear(),
}) => {
  const safeName = escapeHtml(recipientName || "there");
  const safeWorkspace = escapeHtml(workspaceName || "your workspace");
  const safeRole = escapeHtml(role || "Team Member");
  const safeLink = inviteLink || "#";

  const bodyHtml = `
    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 10px;">
      Hi <strong style="color:${BRAND.ink};">${safeName}</strong>,<br/>
      You’ve been invited to join <strong style="color:${BRAND.ink};">${safeWorkspace}</strong> on OutletOps as <strong style="color:${BRAND.ink};">${safeRole}</strong>.
    </div>

    <div style="background:#F1F5F9;border:1px solid ${BRAND.border};border-radius:14px;padding:14px 16px;margin:14px 0 18px;">
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <div style="width:34px;height:34px;border-radius:10px;background:#FFF4EF;border:1px solid #FFD5C0;text-align:center;line-height:34px;font-weight:900;color:${BRAND.primary};">!</div>
        <div style="flex:1;">
          <div style="font-size:13px;color:${BRAND.ink};font-weight:800;margin-bottom:4px;">Quick note</div>
          <div style="font-size:13px;color:${BRAND.muted};line-height:1.65;">
            This invite link is unique to you and expires in <strong>7 days</strong>. Do not share it publicly.
          </div>
        </div>
      </div>
    </div>

    <div style="margin:0 0 14px;">
      ${["POS", "HRM", "Payroll", "Staff Mgmt", "Attendance"].map(renderPill).join("&nbsp;")}
    </div>

    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 18px;">
      OutletOps helps your team run day-to-day operations in one place—billing, staff, payroll, and attendance.
    </div>

    <div style="text-align:center;margin:18px 0 18px;">
      ${renderButton({ href: safeLink, label: "Accept Invitation" })}
    </div>

    <div style="font-size:12px;color:#94A3B8;line-height:1.75;">
      If you have questions, contact
      <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND.primary};text-decoration:none;">${escapeHtml(
        supportEmail,
      )}</a>.
      ${renderDivider()}
      <div>
        Or use this link:<br/>
        <a href="${safeLink}" style="color:${BRAND.primary};text-decoration:none;word-break:break-all;">${escapeHtml(
          safeLink,
        )}</a>
      </div>
    </div>
  `;

  return renderEmailShell({
    title: `You're invited to ${workspaceName || "OutletOps"}`,
    preheader: `Invitation to join ${workspaceName || "your workspace"} on OutletOps.`,
    heading: "You’re invited",
    bodyHtml,
    year,
    supportEmail,
    footerNote:
      "You received this email because you were invited to an OutletOps workspace/outlet.",
  });
};

// C) OTP Verification (Premium HTML)
export function emailVerificationOtp(otp) {
  const code = escapeHtml(String(otp ?? "").trim());

  const bodyHtml = `
    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 14px;">
      Use the verification code below to continue. This code is valid for <strong style="color:${BRAND.ink};">5 minutes</strong>.
    </div>

    <div style="text-align:center;margin:18px 0 10px;">
      <div style="display:inline-block;background:#FFF7F2;border:1px dashed ${BRAND.primary};border-radius:14px;padding:16px 22px;">
        <div style="font-size:12px;color:${BRAND.muted};font-weight:800;letter-spacing:.35px;margin-bottom:8px;">YOUR OTP</div>
        <div style="font-size:40px;font-weight:900;color:${BRAND.primary};letter-spacing:10px;font-family:ui-monospace, Menlo, Monaco, Consolas, 'Courier New', monospace;">
          ${code}
        </div>
      </div>
    </div>

    <div style="color:#94A3B8;font-size:12px;line-height:1.75;margin:14px 0 0;">
      Never share this code with anyone. OutletOps support will never ask you for your OTP.
    </div>
  `;

  return renderEmailShell({
    title: "Your OutletOps verification code",
    preheader: "Your OTP code for OutletOps (valid for 5 minutes).",
    heading: "Verification code",
    bodyHtml,
    footerNote:
      "If you didn’t request this code, secure your account immediately.",
  });
}

// D) Organization Onboarding (Premium HTML)
export const organizationOnboardingEmail = ({
  adminName = "there",
  orgName,
  planName = "Trial",
  modules = ["POS", "HRM", "Payroll", "Attendance", "Staff Management"],
  createdAt = new Date(),
  orgId,
  adminEmail,
  loginUrl,
  setupChecklistUrl,
  supportEmail = "support@outletops.com",
  year = new Date().getFullYear(),
}) => {
  const safeAdmin = escapeHtml(adminName || "there");
  const safeOrg = escapeHtml(orgName || "your organization");
  const safePlan = escapeHtml(planName || "Trial");
  const safeOrgId = escapeHtml(orgId || "—");
  const safeAdminEmail = escapeHtml(adminEmail || "—");
  const safeLoginUrl =
    loginUrl || process.env.FRONTEND_URL || "https://outletops.com";
  const safeChecklistUrl = setupChecklistUrl || safeLoginUrl;

  const created = (() => {
    try {
      return new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  })();

  const bodyHtml = `
    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 12px;">
      Hi <strong style="color:${BRAND.ink};">${safeAdmin}</strong>,<br/>
      Your organization <strong style="color:${BRAND.ink};">${safeOrg}</strong> is now set up on OutletOps.
      Below are your onboarding details and next steps to go live quickly.
    </div>

    <div style="background:#F1F5F9;border:1px solid ${BRAND.border};border-radius:14px;padding:14px 16px;margin:14px 0 18px;">
      <div style="font-size:12px;color:${BRAND.muted};font-weight:900;letter-spacing:.35px;margin-bottom:8px;">
        ORGANIZATION DETAILS
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#94A3B8;font-size:12px;width:160px;">Organization</td>
          <td style="padding:8px 0;color:${BRAND.ink};font-size:13px;font-weight:800;">${safeOrg}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94A3B8;font-size:12px;">Plan</td>
          <td style="padding:8px 0;color:${BRAND.ink};font-size:13px;font-weight:800;">${safePlan}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94A3B8;font-size:12px;">Organization ID</td>
          <td style="padding:8px 0;color:${BRAND.ink};font-size:13px;font-weight:800;">${safeOrgId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94A3B8;font-size:12px;">Admin Email</td>
          <td style="padding:8px 0;color:${BRAND.ink};font-size:13px;font-weight:800;">${safeAdminEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#94A3B8;font-size:12px;">Created On</td>
          <td style="padding:8px 0;color:${BRAND.ink};font-size:13px;font-weight:800;">${escapeHtml(
            created,
          )}</td>
        </tr>
      </table>
    </div>

    <div style="margin:0 0 14px;">
      ${(modules?.length
        ? modules
        : ["POS", "HRM", "Payroll", "Attendance", "Staff Management"]
      )
        .slice(0, 8)
        .map(renderPill)
        .join("&nbsp;")}
    </div>

    <div style="background:#FFF7F2;border:1px solid #FFD5C0;border-radius:14px;padding:14px 16px;margin:14px 0 18px;">
      <div style="font-size:13px;color:${BRAND.ink};font-weight:900;margin-bottom:8px;">
        Recommended setup checklist
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">✅ Add outlets/locations and business profile</td></tr>
        <tr><td style="padding:6px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">✅ Invite managers/staff and assign roles</td></tr>
        <tr><td style="padding:6px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">✅ Configure attendance rules & shifts</td></tr>
        <tr><td style="padding:6px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">✅ Set payroll cycle and salary components</td></tr>
        <tr><td style="padding:6px 0;color:${BRAND.muted};font-size:13px;line-height:1.6;">✅ Configure POS items/taxes (if using POS)</td></tr>
      </table>
    </div>

    <div style="text-align:center;margin:18px 0 10px;">
      ${renderButton({ href: safeLoginUrl, label: "Go to Dashboard" })}
    </div>

    <div style="text-align:center;margin:10px 0 18px;">
      <a href="${safeChecklistUrl}" style="color:${BRAND.primary};text-decoration:none;font-weight:800;font-size:13px;">
        Open Setup Checklist →
      </a>
    </div>

    <div style="font-size:12px;color:#94A3B8;line-height:1.75;">
      ${renderDivider()}
      If you need help with onboarding, reply to this email or contact
      <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND.primary};text-decoration:none;">${escapeHtml(
        supportEmail,
      )}</a>.
      <div style="margin-top:10px;">
        Dashboard link:<br/>
        <a href="${safeLoginUrl}" style="color:${BRAND.primary};text-decoration:none;word-break:break-all;">${escapeHtml(
          safeLoginUrl,
        )}</a>
      </div>
    </div>
  `;

  return renderEmailShell({
    title: `Welcome to OutletOps — ${orgName || "Organization"} onboarded`,
    preheader: `Your organization ${orgName || ""} is ready on OutletOps. Next steps inside.`,
    heading: "Organization onboarded",
    bodyHtml,
    year,
    supportEmail,
    footerNote:
      "You received this email because an organization was created on OutletOps.",
  });
};

// E) Invoice Due (Premium HTML)
export const invoiceDueEmailTemplate = ({
  orgName,
  invoiceId,
  amount,
  currency = "USD",
  dueDate,
  notes,
  paymentLink,
  billingEmail = "billing@outletops.com",
  supportEmail = "support@outletops.com",
  year = new Date().getFullYear(),
}) => {
  const safeOrg = escapeHtml(orgName || "there");
  const safeInvoice = escapeHtml(invoiceId || "—");
  const safeNotes = notes ? escapeHtml(notes) : "";

  const formattedAmount =
    typeof amount === "number"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
          amount,
        )
      : escapeHtml(String(amount ?? "—"));

  const formattedDueDate = dueDate
    ? (() => {
        try {
          return new Date(dueDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return escapeHtml(String(dueDate));
        }
      })()
    : "—";

  const urgencyTag = (() => {
    if (!dueDate)
      return {
        label: "Payment Due",
        bg: "#FFF7F2",
        border: "#FFD5C0",
        color: BRAND.primary,
      };
    const d = new Date(dueDate).getTime();
    if (Number.isNaN(d))
      return {
        label: "Payment Due",
        bg: "#FFF7F2",
        border: "#FFD5C0",
        color: BRAND.primary,
      };
    const diffDays = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 2)
      return {
        label: "Due Soon",
        bg: "#FEF2F2",
        border: "#FECACA",
        color: "#B91C1C",
      };
    if (diffDays <= 7)
      return {
        label: "Upcoming",
        bg: "#FFFBEB",
        border: "#FDE68A",
        color: "#92400E",
      };
    return {
      label: "Payment Due",
      bg: "#FFF7F2",
      border: "#FFD5C0",
      color: BRAND.primary,
    };
  })();

  const bodyHtml = `
    <div style="color:${BRAND.muted};font-size:14px;line-height:1.75;margin:0 0 12px;">
      Hi <strong style="color:${BRAND.ink};">${safeOrg}</strong>,<br/>
      Your OutletOps subscription invoice is ready. Please complete payment before the due date to avoid any interruption.
    </div>

    <div style="display:inline-block;background:${urgencyTag.bg};border:1px solid ${urgencyTag.border};color:${urgencyTag.color};
      font-size:12px;font-weight:900;border-radius:999px;padding:6px 12px;letter-spacing:.3px;margin:6px 0 14px;">
      ${escapeHtml(urgencyTag.label)}
    </div>

    <div style="background:#F1F5F9;border:1px solid ${BRAND.border};border-radius:14px;padding:16px;margin:14px 0 18px;">
      <div style="font-size:12px;color:${BRAND.muted};font-weight:900;letter-spacing:.35px;margin-bottom:10px;">
        INVOICE SUMMARY
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:12px;width:160px;">Invoice ID</td>
          <td style="padding:10px 0;color:${BRAND.ink};font-size:13px;font-weight:900;">${safeInvoice}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:12px;">Amount</td>
          <td style="padding:10px 0;color:${BRAND.ink};font-size:18px;font-weight:900;">${escapeHtml(
            formattedAmount,
          )}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:12px;">Due Date</td>
          <td style="padding:10px 0;color:${BRAND.ink};font-size:13px;font-weight:900;">${escapeHtml(
            formattedDueDate,
          )}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:12px;vertical-align:top;">For</td>
          <td style="padding:10px 0;color:${BRAND.ink};font-size:13px;font-weight:800;line-height:1.6;">
            OutletOps — Business Suite Subscription<br/>
            <span style="font-size:12px;color:${BRAND.muted};font-weight:600;">POS • HRM • Payroll • Attendance • Staff Management</span>
          </td>
        </tr>
      </table>

      ${
        safeNotes
          ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px dashed ${BRAND.border};">
          <div style="font-size:12px;color:${BRAND.muted};font-weight:900;letter-spacing:.35px;margin-bottom:6px;">NOTES</div>
          <div style="font-size:13px;color:${BRAND.muted};line-height:1.7;">${safeNotes}</div>
        </div>
      `
          : ""
      }
    </div>

    ${
      paymentLink
        ? `
      <div style="text-align:center;margin:18px 0 10px;">
        ${renderButton({ href: paymentLink, label: "Pay Now" })}
      </div>
      <div style="text-align:center;margin:10px 0 16px;">
        <span style="font-size:12px;color:#94A3B8;line-height:1.6;">
          If the button doesn’t work, use this link:<br/>
          <a href="${paymentLink}" style="color:${BRAND.primary};text-decoration:none;word-break:break-all;">${escapeHtml(
            paymentLink,
          )}</a>
        </span>
      </div>
    `
        : `
      <div style="background:#FFF7F2;border:1px solid #FFD5C0;border-radius:14px;padding:14px 16px;margin:14px 0 18px;">
        <div style="font-size:13px;color:${BRAND.ink};font-weight:900;margin-bottom:6px;">Payment link not included</div>
        <div style="font-size:13px;color:${BRAND.muted};line-height:1.7;">
          Please contact billing to complete payment: 
          <a href="mailto:${escapeHtml(billingEmail)}" style="color:${BRAND.primary};text-decoration:none;font-weight:800;">${escapeHtml(
            billingEmail,
          )}</a>.
        </div>
      </div>
    `
    }

    <div style="font-size:12px;color:#94A3B8;line-height:1.75;">
      ${renderDivider()}
      If you’ve already paid, you can ignore this message. For billing support, contact
      <a href="mailto:${escapeHtml(billingEmail)}" style="color:${BRAND.primary};text-decoration:none;">${escapeHtml(
        billingEmail,
      )}</a>.
    </div>
  `;

  return renderEmailShell({
    title: `OutletOps Invoice Due — ${orgName || ""}`,
    preheader: `Invoice ${invoiceId || ""} for ${orgName || "your account"} is due on ${formattedDueDate}.`,
    heading: "Invoice payment due",
    bodyHtml,
    year,
    supportEmail,
    footerNote:
      "You received this billing email for your OutletOps subscription.",
  });
};
