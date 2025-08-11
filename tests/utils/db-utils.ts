import mongoose from 'mongoose';

export const clearAllCollections = async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
};