/* This JavaScript code snippet is setting up a nodemailer transporter to send emails using a Gmail
account. Here's a breakdown of what each part does: */
/* `import nodemailer from "nodemailer";` is importing the nodemailer library/module in JavaScript.
This statement allows you to use the functionalities provided by the nodemailer module in your code. */
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

export const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        html,
    })
}