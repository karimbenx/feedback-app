import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";   // Postgres client
import XLSX from "xlsx";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to Neon DB using DATABASE_URL env variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // set in Render
    ssl: { rejectUnauthorized: false }          // Neon requires SSL
});

// Root route
app.get("/", (req, res) => {
    res.send("✅ Feedback backend with Neon DB is running!");
});

// POST endpoint to save feedback
app.post("/api/feedback", async (req, res) => {
    const { regNo, name, deptYear, comment, rating } = req.body;

    if (!regNo || !name || !deptYear || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await pool.query(
            `INSERT INTO feedbacks (regno, name, deptyear, comment, rating, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
            [regNo, name, deptYear, comment, rating]
        );
        console.log("✅ Feedback saved to Neon DB!");
        res.json({ message: "Feedback saved to Neon DB ✓" });
    } catch (err) {
        console.error("❌ DB Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// GET endpoint to download Excel file generated from Neon DB
app.get("/api/feedback/excel", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM feedbacks ORDER BY created_at DESC");
        const worksheet = XLSX.utils.json_to_sheet(result.rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");

        // Write to a temporary file
        const filePath = "/tmp/feedbacks.xlsx";
        XLSX.writeFile(workbook, filePath);

        res.download(filePath);
    } catch (err) {
        console.error("❌ Excel export error:", err);
        res.status(500).send("Error generating Excel");
    }
});

// ✅ Only one listen call
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 POST http://localhost:${PORT}/api/feedback`);
    console.log(`📍 GET http://localhost:${PORT}/api/feedback/excel`);
});