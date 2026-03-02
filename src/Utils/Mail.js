import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Now you can use require to import 'Mailgen' and 'nodemailer'
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Scraawl",
      link: "https://freeapi.app",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rajpurohitvikramdev@gmail.com",
      pass: "Vikram@9680490601", // It's strongly recommended to use environment variables for sensitive info
    },
  });

  const mail = {
    from: "rajpurohitvikramdev@gmail.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.error("Error: ", error);
  }
};

export const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export function emailVerificationMailContent(username, verificationUrl) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
                  text-align: center;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  border-radius: 10px;
                  padding: 20px;
              }
              h1 {
                  color: #333;
              }
              p {
                  margin-bottom: 20px;
              }
              .button {
                  display: inline-block;
                  background-color: #22BC66;
                  color: #fff;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
              strong {
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Welcome to Scraawl!</h1>
              <p>Dear <strong>${username}</strong>,</p>
              <p>We're very excited to have you on board.</p>
              <p>To verify your email, please click on the following button:</p>
              <a href="${verificationUrl}" class="button"><strong>Verify your email</strong></a>
              <p><strong>Need help, or have questions?</strong> Just reply to this email, we'd love to help.</p>
          </div>
      </body>
      </html>
  `;
}

export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions:
          "To reset your password click on the following button or link:",
        button: {
          color: "#22BC66",
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export const getInviteEmailTemplate = ({
  recipientName = "there",
  workspaceName,
  inviteLink,
  supportEmail = "support@scraawl.com",
  supportName = "The Scraawl Team",
  year = new Date().getFullYear(),
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>You're Invited to Join ${workspaceName} on Scraawl!</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              color: #2C3E50;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15),
                  0 3px 7px -1px rgba(0, 0, 0, 0.08);
              overflow: hidden;
          }
          .header {
              background-color: #0072e8;
              color: #ffffff;
              text-align: center;
              padding: 40px 20px;
              border-top-left-radius: 12px;
              border-top-right-radius: 12px;
          }
          .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
              color: #ffffff;
              letter-spacing: 1px;
          }
          .content {
              padding: 30px 40px;
              color: #2C3E50;
              font-size: 16px;
              line-height: 1.5;
          }
          .content h2 {
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
              font-weight: 600;
          }
          .button-container {
              text-align: center;
              margin: 30px 0;
          }
          .button {
              display: inline-block;
              background-color: #0072e8;
              color: #ffffff;
              padding: 16px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 19px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
              transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
          }
          .button:hover {
              background-color: #2980B9;
              transform: translateY(-1px);
          }
          .button:active {
              transform: translateY(0);
          }
          .footer {
              background-color: #0072e8;
              padding: 25px 40px;
              text-align: center;
              font-size: 13px;
              color: #ffffff;
              border-top: 1px solid #D5DBE0;
              border-bottom-left-radius: 12px;
              border-bottom-right-radius: 12px;
          }
          .footer a {
              color: #3498DB;
              text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100% !important;
                  margin: 0 !important;
                  border-radius: 0 !important;
                  box-shadow: none !important;
              }
              .content, .footer {
                  padding: 20px !important;
              }
              .header {
                  padding: 30px 20px !important;
                  border-radius: 0 !important;
              }
              .header h1 {
                  font-size: 28px !important;
              }
              .button {
                  padding: 14px 28px !important;
                  font-size: 17px !important;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://capsitech.blob.core.windows.net/slk-uat/logo.png" alt="Scraawl Logo" style="max-width: 150px; height: auto; margin-bottom: 10px;" />
              <h1>Scraawl</h1>
          </div>
          <div class="content">
              <p>Hi ${recipientName},</p>
              <p>
                You've been invited to join the <strong>${workspaceName}</strong> workspace on Scraawl, your new hub for team communication and collaboration!
              </p>
              <p>
                Scraawl is designed to streamline your office communication, making it easy to connect with your colleagues, share updates, and collaborate on projects in a professional and organized environment.
              </p>
              <h2>Here's how to get started:</h2>
              <ol style="padding-left: 20px; margin-bottom: 20px;">
                  <li style="margin-bottom: 12px;"><strong>Click the button below to accept your invitation:</strong></li>
              </ol>
              <div class="button-container">
                  <a style="color: #ffffff;" href="${inviteLink}" class="button" target="_blank" rel="noopener noreferrer">Join ${workspaceName}</a>
              </div>
              <p style="font-size: 14px; color: #7F8C8D; text-align: center; margin-top: 10px;">
                <em>(This link is unique to you and will guide you through the quick setup process.)</em>
              </p>
              <ol start="2" style="padding-left: 20px; margin-top: 0;">
                  <li style="margin-bottom: 12px;"><strong>Set up your profile:</strong> Once you've accepted, personalize your profile and get ready to connect with your team.</li>
                  <li style="margin-bottom: 12px;"><strong>Explore your workspace:</strong> Dive into channels like <code>#general</code> for team-wide announcements or <code>#projects</code> for specific discussions. You can also send direct messages to colleagues.</li>
              </ol>
              <p>
                If you have any questions or need assistance, please don't hesitate to contact <a href="mailto:${supportEmail}" style="color: #3498DB; text-decoration: none;">${supportName}</a>.
              </p>
              <p>Welcome to Scraawl!</p>
              <p>Best regards,</p>
              <p>${supportName}</p>
          </div>
          <div class="footer">
              <p>&copy; ${year} Scraawl. All rights reserved.</p>
              <p>You received this email because you were invited to a Scraawl workspace.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

export function emailVerificationOtp(otp) {
  return `
  <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
  <div style="background-color: #0078EF; padding: 20px 30px;">
    <h2 style="color: #ffffff; margin: 0;">SCRAAWL</h2>
    <p style="color: #ffffff; font-size: 16px; margin: 4px 0 0;">Secure your conversations with a quick verification</p>
  </div>
  <div style="padding: 30px; background-color: #ffffff;">
    <h3 style="margin-top: 0; color: #333333;">Your OTP Code</h3>
    <p style="font-size: 16px; color: #555;">Hi there,</p>
    <p style="font-size: 16px; color: #555;">To verify your email address for Scraawl Chat, please use the following One-Time Password (OTP):</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 28px; color: #0078EF; background-color: #f2f9ff; padding: 10px 20px; border-radius: 8px; letter-spacing: 4px;">
        <strong>${otp}</strong>
      </span>
    </div>

    <p style="font-size: 14px; color: #999;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
    <p style="font-size: 14px; color: #999;">If you didn’t request this, you can safely ignore this email.</p>

    <p style="margin-top: 40px; font-size: 14px; color: #888;">Cheers,<br/>The Scraawl Team</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #aaa;">
    &copy; ${new Date().getFullYear()} Scraawl. All rights reserved.
  </div>
</div>

  `;
}

