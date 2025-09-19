import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
}

export const checkPassword = (password: string, hashedPassword: string) => {
	return bcrypt.compare(password, hashedPassword)
}