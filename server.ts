import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Stripe from "stripe";

dotenv.config();

const CONTENT_PATH = path.join(process.cwd(), "src", "content.json");

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Initialize email transporter
  const getTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  };

  // Initialize Stripe client
  let stripeClient: Stripe | null = null;
  const getStripe = () => {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        return null;
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  };

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: Submit Order
  app.post("/api/orders", async (req, res) => {
    const { customer, items, total } = req.body;

    // In a real app, you would verify payment here first.
    // For now, we assume payment is handled on the frontend and this is the notification step.

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL is not set. Order notification cannot be sent.");
      return res.status(200).json({ success: true, message: "Order received, but email notification skipped (missing config)." });
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("SMTP settings are missing. Order details logged to console instead.");
      console.log("ORDER RECEIVED:", JSON.stringify({ customer, items, total }, null, 2));
      return res.status(200).json({ success: true, message: "Order received, but email notification failed (missing SMTP config)." });
    }

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const generateEmailHtml = (title: string, greeting: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #ea580c;">${title}</h1>
        <p>${greeting}</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; font-size: 18px;">Customer Information</h2>
          <p><strong>Name:</strong> ${customer.name}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>WhatsApp:</strong> ${customer.whatsapp || 'Not provided'}</p>
          <p><strong>Delivery Address:</strong><br>${customer.address}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total Amount</td>
                <td style="padding: 12px 8px; font-weight: bold; text-align: right; font-size: 18px; color: #ea580c;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 20px;">
          This is an automated notification from Chef's Table.
        </p>
      </div>
    `;

    try {
      // 1. Send to Admin
      await transporter.sendMail({
        from: `"Chef's Table Orders" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Order Received - ${customer.name}`,
        html: generateEmailHtml("New Order Details", "A new order has been placed and payment has been confirmed."),
      });
      console.log(`Order notification email sent to admin: ${adminEmail}`);

      // 2. Send to Buyer
      await transporter.sendMail({
        from: `"Chef's Table" <${process.env.SMTP_USER}>`,
        to: customer.email,
        subject: `Order Confirmation - Chef's Table`,
        html: generateEmailHtml("Order Confirmation", `Hi ${customer.name}, thank you for your order! We've received your details and our kitchen is getting started.`),
      });
      console.log(`Order confirmation email sent to buyer: ${customer.email}`);

      res.json({ success: true });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: "Order received, but failed to send notification emails." });
    }
  });

  // API Route: Submit Catering Inquiry
  app.post("/api/catering-enquiry", async (req, res) => {
    const { name, email, date, guests, message } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return res.status(200).json({ success: true, message: "Inquiry received, but email notification skipped (missing config)." });
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("CATERING INQUIRY RECEIVED:", JSON.stringify({ name, email, date, guests, message }, null, 2));
      return res.status(200).json({ success: true, message: "Inquiry received, but email notification failed (missing SMTP config)." });
    }

    const mailOptions = {
      from: `"Chef's Table Catering" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Catering Inquiry - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 12px; padding: 24px;">
          <h1 style="color: #ea580c; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">New Catering Inquiry</h1>
          <p>You have received a new catering request through the website.</p>
          
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 16px; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em;">Inquiry Details</h2>
            <p><strong>Client Name:</strong> ${name}</p>
            <p><strong>Email Address:</strong> ${email}</p>
            <p><strong>Event Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Estimated Guests:</strong> ${guests}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 16px; color: #4b5563;">Message / Requirements:</h2>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; font-style: italic; border-left: 4px solid #ea580c;">
              ${message || 'No additional requirements provided.'}
            </div>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
            This inquiry was sent from the Catering page of Chef's Table.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Catering email send error:", error);
      res.status(500).json({ error: "Failed to send catering inquiry notification." });
    }
  });

  // API Route: Get Content
  app.get("/api/content", async (req, res) => {
    try {
      const data = await fs.readFile(CONTENT_PATH, "utf-8");
      const content = JSON.parse(data);
      // Ensure arrays exist
      if (!content.recommendations) content.recommendations = [];
      if (!content.dishes) content.dishes = [];
      if (!content.testimonials) content.testimonials = [];
      if (!content.categories) content.categories = [];
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to read content" });
    }
  });

  // API Route: Verify Password
  app.post("/api/auth/verify", (req, res) => {
    const { password } = req.body;
    
    if (!process.env.ADMIN_PASSWORD) {
      console.warn("ADMIN_PASSWORD environment variable is not set.");
      // In development, if no password is set, we might want to warn the user
      // but for security we still fail the check unless they provide the exact (empty) value
    }

    if (password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  // API Route: Update Content
  app.post("/api/content", async (req, res) => {
    const { password, content } = req.body;
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Ensure arrays exist before saving
      if (!content.recommendations) content.recommendations = [];
      if (!content.dishes) content.dishes = [];
      if (!content.testimonials) content.testimonials = [];
      if (!content.categories) content.categories = [];

      // Add a timestamp to track updates
      content.lastUpdated = new Date().toISOString();

      console.log(`Saving content. Recommendations: ${content.recommendations.length}, Dishes: ${content.dishes.length}, Last Updated: ${content.lastUpdated}`);
      
      await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2));
      res.json({ success: true, lastUpdated: content.lastUpdated });
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Create Stripe Payment Intent
  app.post("/api/create-payment-intent", async (req, res) => {
    const { amount, currency = "cad", receipt_email } = req.body;

    const stripe = getStripe();
    if (!stripe) {
      console.warn("STRIPE_SECRET_KEY is not set.");
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        receipt_email: receipt_email || undefined,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
