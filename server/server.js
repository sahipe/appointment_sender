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
    origin: ["http://72.60.103.3:3001"],
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
    const { letters } = req.body;
    if (!letters || !letters.length) {
      return res.status(400).json({ error: "No letters provided" });
    }

    // ✅ Setup SSE response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendProgress = (message) => {
      res.write(`data: ${message}\n\n`);
    };

    const today = new Date().toISOString().split("T")[0];
    const dirPath = path.join(__dirname, "letters", today);
    await fs.ensureDir(dirPath);

    const success = [];
    const failed = [];

    sendProgress(
      `📩 Starting to send ${letters.length} appointment letters...`
    );

    for (const [index, letter] of letters.entries()) {
      const { pdfName, pdfBase64, email, name, designation, company } = letter;

      sendProgress(`📨 Preparing ${pdfName} for ${name} (${email})`);

      try {
        const filePath = path.join(dirPath, pdfName);
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        await fs.writeFile(filePath, pdfBuffer);

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
                <p>Best regards,<br><strong>Jyoti</strong><br>HR Manager</p>
              </div>
            </div>
          `,
          attachments: [
            ...logoAttachments,
            { filename: pdfName, path: filePath },
          ],
        });

        sendProgress(`✅ ${pdfName} sent successfully`);
        success.push(email);
      } catch (err) {
        sendProgress(`❌ Failed to send ${pdfName}: ${err.message}`);
        failed.push(email);
      }

      await sleep(1000);
    }

    sendProgress(
      `✅ Completed. Success: ${success.length}, Failed: ${failed.length}`
    );
    res.write("event: end\ndata: done\n\n");
    res.end();
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
