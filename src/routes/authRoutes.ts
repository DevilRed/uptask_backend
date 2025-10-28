import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

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

router.post('/forgot-password',
	body('email')
		.notEmpty().withMessage('Email is required'),
	handleInputErrors,
	AuthController.forgotPassword
)

router.post('/validate-token',
	body('token')
		.notEmpty().withMessage('Token is required'),
	handleInputErrors,
	AuthController.validateToken
)

router.post('/update-password/:token',
	param('token')
		.isNumeric().withMessage('Invalid token'),
	body("password")
		.notEmpty().withMessage("Password is required")
		.isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
	body("password_confirmation")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match"),
	handleInputErrors,
	AuthController.updatePasswordWithToken
)

router.get('/user',
	authenticate,
	AuthController.user
)

// profile routes
router.put('/profile',
	authenticate,
	body("name")
		.notEmpty().withMessage("Name is required"),
	body("email")
		.isEmail().withMessage("Invalid email"),
	handleInputErrors,
	AuthController.updateProfile
)
// change password
router.post('/update-password',
	authenticate,
	body("current_password")
		.notEmpty().withMessage("Current password is required"),
	body("password")
		.notEmpty().withMessage("Password is required")
		.isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
	body("password_confirmation")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match"),
	handleInputErrors,
	AuthController.updateCurrentUserPassword
)

router.post('/check-password',
	authenticate,
	body("password")
		.notEmpty().withMessage("Password is required"),
	handleInputErrors,
	AuthController.checkPassword
)
export default router;
