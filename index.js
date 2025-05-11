import express from "express";
import mongoose from "mongoose";
import Login from "./models/login.js";
import Employee from "./models/employee.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = "mongodb+srv://lrajouri2002:65.hemsLY3rtLDh@cluster0.bttrjvu.mongodb.net/authAdmin?retryWrites=true&w=majority";

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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Login.findOne({ f_userName: username });

  if (!user || user.f_Pwd !== password) {
    return res.send("<script>alert('Invalid login details'); window.location.href = '/';</script>");
  }

    // After successful login, redirect to dashboard
    res.redirect("/dashboard");
});



app.get("/add-test-employee", async (req, res) => {
  const names = ["John", "Alice", "Raj", "Priya", "Aman", "Neha"];
  const courses = ["BCA", "MCA", "Java", "Python", "BSC", "Data Science"];

  try {
    // Generate random values
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];
    const randomId = Math.floor(Math.random() * 1000);
    const currentDate = new Date();

    const emp = new Employee({
      f_Id: randomId,
      f_Image: "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg", // Placeholder image
      f_Name: randomName,
      f_Email: `${randomName.toLowerCase()}${randomId}@example.com`,
      f_Mobile: "9999999999",
      f_Designation: "Developer",
      f_gender: "Male", // or randomize with ["Male", "Female"]
      f_Course: randomCourse,
      f_Createdate: currentDate,
      active: true
    });

    await emp.save();
    res.send("Random test employee added ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding random test employee");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const employees = await Employee.find();
    console.log("Employees fetched: ", employees);  // Log the fetched data
    res.render("dashboard", { employees: employees });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).send("Error fetching employees");
  }
});



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
