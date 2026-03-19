import Contact from "../models/Contact.js";
import sendEmail from "../utils/sendEmail.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message || !subject) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      message,
      subject,
    });

    await sendEmail({
      to: "cudelivery001@gmail.com",
      subject: `📩 New Contact Query: ${subject}`,

      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      
      <h2 style="color: #f97316;">New Message from CuDelivery</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>

      <hr style="margin: 15px 0;" />

      <p><strong>Message:</strong></p>
      <p style="background:#f9fafb; padding:10px; border-radius:8px;">
        ${message}
      </p>

      <br/>

      <p style="font-size:12px; color:gray;">
        This message was sent from CuDelivery Contact Form.
      </p>

    </div>
  `,
    });
    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
