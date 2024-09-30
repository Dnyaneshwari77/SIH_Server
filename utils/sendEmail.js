const nodemailer = require("nodemailer");

const sendEmail = async (req, res) => {
  const {
    email,
    name,
    hospital,
    doctor,
    slot,
    transactionId,
    totalCharges,
    qrCodeDataUrl,
  } = req.body;

  console.log("Body :", req.body);

  console.log("SendEmail Reached");
  try {
    // Create a transporter object
    let transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service
      auth: {
        user: "dyaneshwari.pandhare.cs@ghrcem.raisoni.net",
        pass: "Kishor$123", 
      },
    });

    // Define email options
    const mailOptions = {
      from: "dyaneshwari.pandhare.cs@ghrcem.raisoni.ne",
      to: email,
      subject: "Appointment Confirmation",
      text: `
        Hello ${name},
        
        Your appointment has been confirmed.
        Hospital: ${hospital}
        Doctor: ${doctor}
        Slot: ${slot}
        Transaction ID: ${transactionId}
        Total Charges: $${totalCharges}

        Please present the attached QR code at the hospital.
      `,
      attachments: [
        {
          filename: "qr-code.png",
          path: qrCodeDataUrl,
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email", error);
    res.status(500).send("Error sending email");
  }
};

module.exports = sendEmail;
