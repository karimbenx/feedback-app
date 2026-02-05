import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import XLSX from "xlsx";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./feedbacks.json";

// Helper: load feedbacks
const loadFeedbacks = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Helper: save feedbacks
const saveFeedbacks = (feedbacks) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
};

// Root route
app.get("/", (req, res) => {
    res.send("✅ Feedback backend running locally without Postgres!");
});

// POST endpoint to save feedback
app.post("/api/feedback", (req, res) => {
    const { regNo, name, deptYear, comment, rating } = req.body;

    if (!regNo || !name || !deptYear || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const feedbacks = loadFeedbacks();
    const newFeedback = {
        id: Date.now(),
        regno: regNo,
        name,
        deptyear: deptYear,
        comment,
        rating,
        created_at: new Date().toISOString(),
    };

    feedbacks.push(newFeedback);
    saveFeedbacks(feedbacks);

    console.log("✅ Feedback saved locally!");
    res.json({ message: "Feedback saved locally ✓" });
});

// GET endpoint to download Excel file generated from local JSON
app.get("/api/feedback/excel", (req, res) => {
    try {
        const feedbacks = loadFeedbacks();
        const worksheet = XLSX.utils.json_to_sheet(feedbacks);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");

        const filePath = "./feedbacks.xlsx";
        XLSX.writeFile(workbook, filePath);

        res.download(filePath);
    } catch (err) {
        console.error("❌ Excel export error:", err);
        res.status(500).send("Error generating Excel");
    }
});

// ✅ Only one listen call, localhost only
const PORT = 5000;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Server running only on http://127.0.0.1:${PORT}`);
    console.log(`📍 POST http://127.0.0.1:${PORT}/api/feedback`);
    console.log(`📍 GET http://127.0.0.1:${PORT}/api/feedback/excel`);
});