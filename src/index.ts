import 'dotenv/config';
import server from "./server";

const port = process.env.PORT || 4000;

server.listen(port, () => {
	console.log(`REST API running on port ${port}`);
});

// console.log('Hello Node');
// console.log('Environment:', process.env.NODE_ENV);
