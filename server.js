import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import XLSX from "xlsx";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const filePath = "feedbacks.xlsx";

// POST endpoint to save feedback
app.post("/api/feedback", (req, res) => {
    const { regNo, name, deptYear, comment, rating } = req.body;

    if (!regNo || !name || !deptYear || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let workbook, worksheet, data;

    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets["Feedbacks"];
        data = worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];
    } else {
        workbook = XLSX.utils.book_new();
        data = [];
    }

    data.push({
        RegNo: regNo,
        Name: name,
        DeptYear: deptYear,
        Comment: comment,
        Rating: rating,
        CreatedAt: new Date().toLocaleString(),
    });

    worksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets["Feedbacks"] = worksheet;
    if (!workbook.SheetNames.includes("Feedbacks")) {
        workbook.SheetNames.push("Feedbacks");
    }

    XLSX.writeFile(workbook, filePath);

    console.log("✅ Feedback saved to Excel!");
    res.json({ message: "Feedback saved to Excel ✓" });
});

// GET endpoint to download Excel file
app.get("/api/feedback/excel", (req, res) => {
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("No feedbacks yet.");
    }
});

// ✅ Only one listen call
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 POST http://localhost:${PORT}/api/feedback`);
    console.log(`📍 GET http://localhost:${PORT}/api/feedback/excel`);
});