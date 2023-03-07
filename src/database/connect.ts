import mongoose from "mongoose";
const connect = async () => {
    await mongoose.connect(
        `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.9xiqgor.mongodb.net/newsociality?retryWrites=true&w=majority`
    );
};
export default connect;
