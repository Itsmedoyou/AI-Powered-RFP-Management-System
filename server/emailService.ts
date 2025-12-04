import nodemailer from "nodemailer";
import type { Rfp, Vendor } from "@shared/schema";

// Email transporter configuration
// In production, configure with real SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

function generateRfpEmailHtml(rfp: Rfp, vendor: Vendor): string {
  const itemsHtml = rfp.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.specs}</td>
    </tr>
  `
    )
    .join("");

  const mandatoryCriteriaHtml = rfp.mandatoryCriteria.length
    ? `
    <h3 style="color: #374151; margin-top: 24px;">Mandatory Requirements</h3>
    <ul style="color: #4b5563;">
      ${rfp.mandatoryCriteria.map((c) => `<li>${c}</li>`).join("")}
    </ul>
  `
    : "";

  const optionalCriteriaHtml = rfp.optionalCriteria.length
    ? `
    <h3 style="color: #374151; margin-top: 24px;">Optional/Preferred Requirements</h3>
    <ul style="color: #4b5563;">
      ${rfp.optionalCriteria.map((c) => `<li>${c}</li>`).join("")}
    </ul>
  `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Request for Proposal</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${rfp.title}</p>
  </div>

  <p style="color: #4b5563;">Dear ${vendor.contactPerson},</p>
  
  <p style="color: #4b5563;">We are pleased to invite ${vendor.name} to submit a proposal for the following procurement requirements:</p>

  <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
    <h2 style="color: #374151; margin-top: 0;">Procurement Details</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      ${rfp.totalBudget ? `<tr><td style="padding: 8px 0; color: #6b7280;">Budget:</td><td style="padding: 8px 0; font-weight: 600;">${rfp.currency} ${rfp.totalBudget.toLocaleString()}</td></tr>` : ""}
      ${rfp.deliveryDays ? `<tr><td style="padding: 8px 0; color: #6b7280;">Delivery Required:</td><td style="padding: 8px 0; font-weight: 600;">${rfp.deliveryDays} days</td></tr>` : ""}
      ${rfp.paymentTerms ? `<tr><td style="padding: 8px 0; color: #6b7280;">Payment Terms:</td><td style="padding: 8px 0; font-weight: 600;">${rfp.paymentTerms}</td></tr>` : ""}
      ${rfp.warranty ? `<tr><td style="padding: 8px 0; color: #6b7280;">Warranty Required:</td><td style="padding: 8px 0; font-weight: 600;">${rfp.warranty}</td></tr>` : ""}
    </table>
  </div>

  <h2 style="color: #374151;">Required Items</h2>
  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
        <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Quantity</th>
        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Specifications</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  ${mandatoryCriteriaHtml}
  ${optionalCriteriaHtml}

  ${rfp.notes ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;"><strong style="color: #92400e;">Additional Notes:</strong><p style="color: #92400e; margin: 8px 0 0 0;">${rfp.notes}</p></div>` : ""}

  <div style="background: #ecfdf5; border-radius: 8px; padding: 24px; margin: 24px 0;">
    <h3 style="color: #065f46; margin-top: 0;">How to Respond</h3>
    <p style="color: #047857; margin-bottom: 0;">Please reply to this email with your proposal including:</p>
    <ul style="color: #047857;">
      <li>Itemized pricing for each item listed above</li>
      <li>Delivery timeline</li>
      <li>Warranty terms</li>
      <li>Payment terms</li>
      <li>Any additional terms or conditions</li>
    </ul>
    <p style="color: #047857;">You may attach PDF or Excel documents with detailed pricing.</p>
  </div>

  <p style="color: #4b5563;">Thank you for your interest. We look forward to receiving your proposal.</p>

  <p style="color: #4b5563;">Best regards,<br>Procurement Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
  <p style="color: #9ca3af; font-size: 12px;">This is an automated RFP request. Please do not reply directly to this email address for general inquiries.</p>
</body>
</html>
`;
}

export async function sendRfpEmail(vendor: Vendor, rfp: Rfp): Promise<boolean> {
  try {
    const html = generateRfpEmailHtml(rfp, vendor);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "rfp@procurement.example.com",
      to: vendor.email,
      subject: `Request for Proposal - ${rfp.title}`,
      html,
    };

    // In development/demo mode, log instead of sending
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === "smtp.mailtrap.io") {
      console.log(`[EMAIL] Would send RFP to ${vendor.email}:`);
      console.log(`  Subject: ${mailOptions.subject}`);
      console.log(`  To: ${vendor.name} (${vendor.contactPerson})`);
      return true;
    }

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent RFP to ${vendor.email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${vendor.email}:`, error);
    return false;
  }
}
