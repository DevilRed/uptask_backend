import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	console.log('from auth route');
	res.json({ message: 'Auth route working correctly' });
});

export default router;
