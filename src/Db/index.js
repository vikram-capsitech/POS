import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI ??
        "mongodb+srv://vikram:Vikram1436@cluster0.eaasq.mongodb.net/POS?retryWrites=true&w=majority",
    );
    console.log(
      `✅ MongoDB Connected! Host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};
export default connectDb;
