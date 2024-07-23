import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "Uptask <admin@uptask.com>",
      to: user.email,
      subject: "Uptask - Confirm your account",
      text: "Uptask - Confirm your account",
      html: `<p>Hello ${user.name}, you have created your account, thankyou for that, please confirm your account using this verification code: </p>
        <p>Please click on the next link:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account"> Confirm account</a>
        <p>And enter the following code <b>${user.token}</b></p>
        <p>This token expires in 10 minutes</p>
      `,
    });
    console.log("Messsage sent", info.messageId);
  };

  static sendPassowordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "Uptask <admin@uptask.com>",
      to: user.email,
      subject: "Uptask - Reset your password",
      text: "Uptask - Reset your password",
      html: `<p>Hello ${user.name}, you have requested a token to reset your password: </p>
        <p>Please click on the next link:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password"> Reset password</a>
        <p>Enter the following code <b>${user.token}</b></p>
        <p>This token expires in 10 minutes</p>
      `,
    });
    console.log("Messsage sent", info.messageId);
  };
}
