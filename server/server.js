import express from "express";
import bodyParser from "body-parser";
import fs from "fs-extra";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware setup
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: [
      "https://appoinment-letter-sender.netlify.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.rediffmailpro.com",
  port: 587,
  secure: false,
  name: "spekctrum.com",
  auth: {
    user: "hrops@spekctrum.com",
    pass: "Hrops@1234",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ Utility to delay between emails (to avoid SMTP rate limits)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Main endpoint
app.post("/upload-letters", async (req, res) => {
  try {
    const { letters } = req.body; // [{ pdfName, pdfBase64, email, name, ... }]
    if (!letters || !letters.length) {
      return res.status(400).json({ error: "No letters provided" });
    }

    const today = new Date().toISOString().split("T")[0];
    const dirPath = path.join(__dirname, "letters", today);
    await fs.ensureDir(dirPath);

    const success = [];
    const failed = [];

    console.log(`📩 Starting to send ${letters.length} appointment letters...`);

    for (const [index, letter] of letters.entries()) {
      const { pdfName, pdfBase64, email, name, designation, company } = letter;

      console.log(
        `📨 [${index + 1}/${
          letters.length
        }] Preparing email for ${name} (${email})`
      );

      try {
        const filePath = path.join(dirPath, pdfName);
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        await fs.writeFile(filePath, pdfBuffer);

        // Inline logos
        const logoAttachments = [
          {
            filename: "beemalogo.png",
            path: path.join(__dirname, "public/1.png"),
            cid: "logo1",
          },
          {
            filename: "sahipe.png",
            path: path.join(__dirname, "public/2.png"),
            cid: "logo2",
          },
          {
            filename: "udhary.png",
            path: path.join(__dirname, "public/3.png"),
            cid: "logo3",
          },
          {
            filename: "investesy.jpg",
            path: path.join(__dirname, "public/4.png"),
            cid: "logo4",
          },
        ];

        // Send email
        await transporter.sendMail({
          from: '"HR Team" <hrops@spekctrum.com>',
          to: email,
          subject: "Your Appointment Letter",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f5f5f5;">
              <div style="max-width: 800px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px;">
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that you have been selected for the
                <strong>${designation}</strong> at <strong>${company}</strong>.
                Please find your <strong>Appointment Letter</strong> attached.</p>

                <p>If you have any questions, feel free to reach out to us.
                Kindly sign and return a scanned copy of the letter as acceptance.</p>

                <p>Best regards,<br><strong>Jyoti</strong><br>HR Manager</p>
                <p><strong>PH:</strong> +91 76699 93101 | 
                   <strong>Email:</strong> hr@spekctrum.com</p>
                <p>Unit No. 502, 5th Floor, Time House, Plot No. 5, Wazirpur, Delhi - 110052</p>
                <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px;">
                  <img src="cid:logo1" height="40"/>
                  <img src="cid:logo2" height="40"/>
                  <img src="cid:logo3" height="40"/>
                  <img src="cid:logo4" height="40"/>
                </div>
              </div>
            </div>
          `,
          attachments: [
            ...logoAttachments,
            { filename: pdfName, path: filePath },
          ],
        });

        console.log(`✅ Email sent successfully to ${email}`);
        success.push(email);
      } catch (err) {
        console.error(`❌ Failed to send to ${email}:`, err.message);
        failed.push(email);
      }

      // Add a small delay (e.g., 1 second between sends)
      await sleep(1000);
    }

    console.log(
      `✅ Sending completed. Success: ${success.length}, Failed: ${failed.length}`
    );
    res.json({ message: "Email sending completed", success, failed });
  } catch (error) {
    console.error("❌ Fatal server error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* health check */
app.get("/health-check", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
