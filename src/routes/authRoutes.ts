import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post("/create-account",
	body("name")
		.notEmpty().withMessage("Name is required"),
	body("email")
		.isEmail().withMessage("Invalid email"),
	body("password")
		.notEmpty().withMessage("Password is required")
		.isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
	body("password_confirmation")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match"),
	handleInputErrors,
	AuthController.createAccount
);

router.post('/confirm-account',
	body('token')
		.notEmpty().withMessage('Token is required'),
	handleInputErrors,
	AuthController.confirmAccount
)

router.post('/login',
	body('email')
		.notEmpty().withMessage('Email is required'),
	body("password")
		.notEmpty().withMessage("Password is required"),
	handleInputErrors,
	AuthController.login
)

router.post('/request-code',
	body('email')
		.notEmpty().withMessage('Email is required'),
	handleInputErrors,
	AuthController.requestConfirmationCode
)

export default router;
