import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
	origin: function (origin, callback) {
		const whiteList = [process.env.FRONTEND_URL]

		// In development, allow requests with no origin (Postman, mobile apps, etc.)
		// In production, this should be more restrictive
		if (process.env.NODE_ENV === 'development' && !origin) {
			callback(null, true)
			return
		}

		if (whiteList.includes(origin)) {
			callback(null, true)
		} else {
			callback(new Error('CORS error detected'))
		}
	}
}
