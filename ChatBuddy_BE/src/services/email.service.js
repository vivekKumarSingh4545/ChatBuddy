import nodemailer from "nodemailer";

export const sendGreetingEmail = async (toEmail, userName, subject = "Welcome to ChatBuddy! 🎉") => {
  const { BREVO_HOST, BREVO_PORT, BREVO_USER, BREVO_PASS, BREVO_FROM_EMAIL } = process.env;

  if (!BREVO_USER || !BREVO_PASS || BREVO_USER.includes("your_") || BREVO_PASS.includes("your_")) {
    console.warn("⚠️ Brevo SMTP credentials not configured in BE/.env. Greeting email skipped.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: BREVO_HOST || "smtp-relay.brevo.com",
      port: parseInt(BREVO_PORT || "587"),
      secure: false, // true for 465, false for other ports (like 587)
      auth: {
        user: BREVO_USER,
        pass: BREVO_PASS,
      },
    });

    const fromEmail = BREVO_FROM_EMAIL || "vivekkumarsingh4545@gmail.com";

    const mailOptions = {
      from: `"ChatBuddy Support" <${fromEmail}>`,
      to: toEmail,
      subject: subject,
      text: `Hello ${userName},\n\nThank you for registering on ChatBuddy! We're thrilled to have you here.\n\nWith ChatBuddy you can:\n- Enjoy crystal clear voice calls\n- Connect with high-quality video calls\n- Send real-time instant messages\n\nStart chatting now at: https://chatbuddy2.vercel.app\n\nBest regards,\nThe ChatBuddy Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; text-align: center;">Welcome to ChatBuddy, ${userName}! 👋</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">Thank you for registering on our platform. We're thrilled to have you here!</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.5;">With ChatBuddy, you can:</p>
          <ul style="color: #334155; font-size: 15px; line-height: 1.6;">
            <li>Enjoy crystal clear voice calls</li>
            <li>Connect with high-quality video calls (now fully draggable!)</li>
            <li>Send real-time instant messages</li>
          </ul>
          <br />
          <p style="text-align: center; margin: 20px 0;">
            <a href="https://chatbuddy2.vercel.app" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Chatting Now</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
          <p style="font-size: 11px; color: #64748b; text-align: center;">You received this email because you registered on ChatBuddy.</p>
        </div>
      `,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Importance": "Normal",
        "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Brevo SMTP greeting email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending Brevo SMTP greeting email:", error);
    return false;
  }
};
