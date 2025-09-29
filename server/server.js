import express from "express";
import bodyParser from "body-parser";
import fs from "fs-extra";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import cors from "cors";

// ESM __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // replace with your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: "sahipe11@gmail.com",
    pass: "xgofkntyyjnnaowj",
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
        const { pdfName, pdfBase64, email } = letter;
        const filePath = path.join(dirPath, pdfName);

        // Save PDF
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        await fs.writeFile(filePath, pdfBuffer);

        // Inline logos as attachments
        const logoAttachments = [
          {
            filename: "beemalogo.png",
            path: path.join(__dirname, "public/beemalogo.png"),
            cid: "logo1",
          },
          {
            filename: "sahipe.png",
            path: path.join(__dirname, "public/sahipe.png"),
            cid: "logo2",
          },
          {
            filename: "udhary.png",
            path: path.join(__dirname, "public/udhary.png"),
            cid: "logo3",
          },
          {
            filename: "investesy.jpg",
            path: path.join(__dirname, "public/investesy.jpg"),
            cid: "logo4",
          },
        ];
        // Send email
        await transporter.sendMail({
          from: '"HR Team" <sahipe11@gmail.com>',
          to: email,
          subject: "Your Appointment Letter",
          html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f5f5f5; ;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px;">
        <p>Dear abc</p>

        <p>
          We are pleased to inform you that you have been selected for the
          <strong>abc</strong> at
          <strong>abc</strong>.
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
          <img src="cid:logo1" alt="Logo1" style="height:40px;width:120px;object-fit:contain;" />
          <img src="cid:logo2" alt="Logo2" style="height:40px;width:120px;object-fit:contain;" />
          <img src="cid:logo3" alt="Logo3" style="height:40px;width:120px;object-fit:contain;" />
          <img src="cid:logo4" alt="Logo4" style="height:40px;width:120px;object-fit:contain;" />
        </div>
      </div>
    </div>
  `,
          attachments: [
            ...logoAttachments,
            { filename: pdfName, path: filePath }, // the PDF
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
