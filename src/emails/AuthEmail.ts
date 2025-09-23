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
				<a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm your account</a>
				<p>And submit the code: <b>${user.token}</b></p>
				<p>This token expires on 10 minutes</p>
			`
		})
		console.log('Email sent', info.messageId);
	}

	static sendPasswordResetToken = async (user: IEmail) => {
		const info = await transporter.sendMail({
			from: 'UpTask <admin@uptask.com>',
			to: user.email,
			subject: 'UpTask - password reset',
			text: 'UpTask - password reset',
			html: `<p>Hi: ${user.name}, you request to reset your password</p>
				<p>Use following link:</p>
				<a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password</a>
				<p>And submit the code: <b>${user.token}</b></p>
				<p>This token expires on 10 minutes</p>
			`
		})
		console.log('Email sent', info.messageId);
	}
}