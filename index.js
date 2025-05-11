import express from "express";
import mongoose from "mongoose";
import Login from "./models/login.js";
import Employee from "./models/employee.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
const uri = process.env.DATABASE;
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
  if (req.cookies.loggedInUser) {
    return res.redirect("/dashboard");
  }
  res.render("index"); 
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Login.findOne({ f_userName: username });

  if (!user || user.f_Pwd !== password) {
    return res.send("<script>alert('Invalid login details'); window.location.href = '/';</script>");
  }
   res.cookie("loggedInUser", user.f_userName, { httpOnly: true });
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
    if (!req.cookies.loggedInUser) {
    return res.redirect("/");
  }
  res.render("dashboard", {user: req.cookies.loggedInUser});
})

// app.get("/employees", async (req, res) => {
//   if (!req.cookies.loggedInUser) {
//     return res.redirect("/");
//   }
//   try {
//     const employees = await Employee.find();
//     console.log("Employees fetched: ", employees);  // Log the fetched data
//     res.render("employees", { employees: employees });
//   } catch (err) {
//     console.error("Error fetching employees:", err);
//     res.status(500).send("Error fetching employees");
//   }
// });
app.get("/employees", async (req, res) => {
  if (!req.cookies.loggedInUser) {
    return res.redirect("/");
  }

  const searchQuery = req.query.search || "";
  const searchRegex = new RegExp(searchQuery, "i");

  const page = parseInt(req.query.page) || 1;
  const limit = 5;  
  const skip = (page - 1) * limit;  

  const sortField = req.query.sortBy || "f_Name"; 
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; 

  try {
    const totalEmployees = await Employee.countDocuments({
      $or: [
        { f_Name: searchRegex },
        { f_Email: searchRegex }
      ]
    });

    const employees = await Employee.find({
      $or: [
        { f_Name: searchRegex },
        { f_Email: searchRegex }
      ]
    })
      .skip(skip)    
      .limit(limit)  
      .sort({ [sortField]: sortOrder });  

    const totalPages = Math.ceil(totalEmployees / limit); 
    res.render("employees", {
      employees: employees,
      search: searchQuery,
      currentPage: page,
      totalPages: totalPages,
      sortBy: sortField,
      sortOrder: sortOrder
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).send("Error fetching employees");
  }
});

app.post("/employee/:id/toggle", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).send("Employee not found");

    employee.active = !employee.active;
    await employee.save();
    res.redirect("/employees");
  } catch (err) {
    console.error("Error toggling active status:", err);
    res.status(500).send("Server error");
  }
});

app.get("/employee/edit/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).send("Employee not found");

    res.render("edit", { employee });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).send("Server error");
  }
});

app.post("/employee/edit/:id", async (req, res) => {
  try {
    await Employee.findByIdAndUpdate(req.params.id, {
      f_Name: req.body.f_Name,
      f_Course: req.body.f_Course,
    });
    res.redirect("/employees");
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).send("Server error");
  }
});

app.post("/employee/delete/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/employees");
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).send("Server error");
  }
});


app.get("/add-test-employee", async (req, res) => {
  const names = ["John", "Alice", "Raj", "Priya", "Aman", "Neha"];
  const courses = ["BCA", "MCA", "Java", "Python", "BSC", "Data Science"];

  try {
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
      f_gender: "Male", 
      f_Course: randomCourse,
      f_Createdate: currentDate,
      active: true
    });

    await emp.save();
    res.redirect("/employees");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding random test employee");
  }
});


app.get("/logout", (req, res) => {
  res.clearCookie("loggedInUser");
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
