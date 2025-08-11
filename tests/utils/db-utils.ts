import mongoose from 'mongoose';

export const clearAllCollections = async () => {
	// Check if connection is still open before trying to clear collections
	if (mongoose.connection.readyState === 1) {
		const collections = mongoose.connection.collections;
		for (const key in collections) {
			await collections[key].deleteMany({});
		}
	}
};