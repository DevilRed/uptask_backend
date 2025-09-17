import { transporter } from "../config/nodemailer"

interface IEmail {
	email: string
	name: string
	token: string
}

export class AuthEmail {
	static sendConfirmationEmail = async (user: IEmail) => {
		const info = await transporter.sendMail({
			from: 'UpTask <admin@uptask.com>',
			to: user.email,
			subject: 'UpTask - account confirmation',
			text: 'UpTask - account confirmation',
			html: `<p>Hi: ${user.name}, your account on UpTask is almost ready, just have to confirm your account</p>
				<p>Use following link:</p>
				<a href="#">Confirm your account</a>
				<p>And submit the code: <b>${user.token}</b></p>
				<p>This token expires on 10 minutes</p>
			`
		})
		console.log('Email sent', info.messageId);
	}
}