import express from "express";
import mongoose from "mongoose";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

// MongoDB connection
const uri = "mongodb+srv://lrajouri2002:<password>@cluster0.bttrjvu.mongodb.net/mern-test?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connection successful!");
})
.catch(err => {
  console.error("❌ MongoDB connection failed:", err.message);
});

app.get("/", (req, res) => {
  res.render("index"); // Looks for views/index.ejs
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
