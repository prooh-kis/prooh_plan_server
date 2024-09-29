export function sendMailForThankYou({
  toEmail,
  userName,
  requestCameFromURL,
  password,
}) {
  const emailSender = process.env.SENDER_EMAIL || "testgamil4@gmail.com";
  const emailPassword = process.env.EMAIL_PASS || "wcwzgvbanoydwpmu";
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailSender,
      pass: emailPassword,
    },
  });

  console.log("sending thank you email to user");
  console.log(requestCameFromURL);
  transporter
    .sendMail({
      from: emailSender, // sender address
      to: toEmail, // list of receivers
      subject: "Thank you for visiting in monad",
      html: `
          <h2>Hello ${userName}</h2>
          <p>Thank you for signing up on Monad.
          Your email : ${toEmail}
          Password : ${password}
          </p>
          <h3>Advertise as never before...<br>
          Regards<br>
          Monad<br>
          by Vinciis</h3>
          </div>`,
    })
    .then((data) => {
      console.log("Email has send to your email :", toEmail);
    })
    .catch((err) => {
      console.log(err);
    });
}
