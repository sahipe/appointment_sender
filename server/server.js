import express from "express";
import bodyParser from "body-parser";
import fs from "fs-extra";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// ESM __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: "https://appoinment-letter-sender.netlify.app/",
  })
);
app.use(express.static(path.join(__dirname, "public")));

// Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com", // replace with your SMTP server
//   port: 587,
//   secure: false,
//   auth: {
//     user: "sahipe11@gmail.com",
//     pass: "xgofkntyyjnnaowj",
//   },
// });
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // replace with your SMTP server
  port: 587,
  secure: false,
  name: "spekctrum.com",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
  tls: {
    // do not fail on invalid certs (use only if you see cert errors in dev)
    rejectUnauthorized: false,
  },
});

// POST endpoint to receive PDFs
app.post("/upload-letters", async (req, res) => {
  try {
    const { letters } = req.body; // [{ pdfName, pdfBase64, email }, ...]
    // console.log(letters);

    if (!letters || !letters.length) {
      return res.status(400).json({ error: "No letters provided" });
    }

    // Create folder for today
    const today = new Date().toISOString().split("T")[0]; // e.g., 2025-09-29
    const dirPath = path.join(__dirname, "letters", today);
    await fs.ensureDir(dirPath);

    // Map each letter to a promise
    const results = await Promise.allSettled(
      letters.map(async (letter) => {
        const { pdfName, pdfBase64, email, name, designation, company } =
          letter;
        const filePath = path.join(dirPath, pdfName);

        // Save PDF
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        await fs.writeFile(filePath, pdfBuffer);

        // Inline logos as attachments
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

        // ✅ Debug missing files
        logoAttachments.forEach((a) => {
          if (!fs.existsSync(a.path)) {
            console.error(`⚠️ Logo file missing: ${a.path}`);
          }
        });
        // Send email
        await transporter.sendMail({
          from: '"HR Team" <hrops@spekctrum.com>',
          to: email,
          subject: "Your Appointment Letter",
          html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f5f5f5; ;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px;">
        <p>Dear ${name},</p>

        <p>
          We are pleased to inform you that you have been selected for the
          <strong>${designation}</strong> at
          <strong>${company}</strong>.
          Please find your <strong>Appointment Letter</strong> attached to this email.
        </p>

        <p>
          If you have any questions or require clarification, feel free to reach out to us.
          We request you to sign and return a scanned copy of the letter as a token of your acceptance.
        </p>

        <p>We look forward to welcoming you to our team and wish you a successful journey with us.</p>

        <div style="margin-top: 30px;">
          <p><strong>Regards,</strong></p>
          <p><strong>Jyoti</strong></p>
          <p><strong>HR Manager</strong></p>

          <p style="font-size: 14px; margin-top: 5px;">
            <strong>PH :</strong> <a href="tel:+917669993101" style="text-decoration:none;color:#000;">+91 76699 93101</a> |
            <strong>Email :</strong> <a href="mailto:hr@spektrum.com" style="text-decoration:none;color:#1a73e8;">hr@spektrum.com</a>
          </p>
          <p style="font-size: 14px;"><strong>Unit No. 502, 5th Floor, Time House, Plot No. 5, Wajirpur Community Centre, WIA, Delhi - 110052</strong></p>
        </div>

        <div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px;">
                <img src="cid:logo1" height="40" style="margin-right:10px"/>
                <img src="cid:logo2" height="40" style="margin-right:10px"/>
                <img src="cid:logo3" height="40" style="margin-right:10px"/>
                <img src="cid:logo4" height="40"/>
        </div>
      </div>
    </div>
  `,
          attachments: [
            ...logoAttachments, // ✅ include logos
            {
              filename: pdfName,
              path: filePath,
            },
          ],
        });

        return { email, status: "success" };
      })
    );

    // Separate successes and failures
    const success = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value.email);
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r, idx) => letters[idx].email);

    res.json({
      message: "Email sending completed",
      success,
      failed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
