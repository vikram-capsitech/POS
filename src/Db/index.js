import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`DMongoDB Connected! Db host: $: ${connectionInstance.connection.host}`)
    }
    catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}
export default connectDb;