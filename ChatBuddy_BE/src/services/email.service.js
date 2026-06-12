export const sendGreetingEmail = async (toEmail, userName, subject = "Welcome to ChatBuddy! 🎉") => {
  const { BREVO_API_KEY, BREVO_FROM_EMAIL } = process.env;

  if (!BREVO_API_KEY) {
    console.warn("⚠️ Brevo API key not configured. Email skipped.");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "ChatBuddy Support", email: BREVO_FROM_EMAIL || "vivekkumarsingh4545@gmail.com" },
        to: [{ email: toEmail, name: userName }],
        subject: subject,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #6366f1; text-align: center;">Welcome to ChatBuddy, ${userName}! 👋</h2>
            <p style="color: #334155;">Thank you for registering! We're thrilled to have you here.</p>
            <ul style="color: #334155;">
              <li>Crystal clear voice calls</li>
              <li>High-quality video calls</li>
              <li>Real-time instant messages</li>
            </ul>
            <p style="text-align: center; margin: 20px 0;">
              <a href="https://chatbuddy2.vercel.app" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Chatting Now</a>
            </p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      console.log(`✉️ Brevo API email sent successfully to ${toEmail}`);
      return true;
    } else {
      const err = await response.json();
      console.error("❌ Brevo API error:", err);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};