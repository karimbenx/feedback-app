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

    // If file exists, read it
    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets["Feedbacks"];
        data = worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];
    } else {
        workbook = XLSX.utils.book_new();
        data = [];
    }

    // Add new row
    data.push({
        RegNo: regNo,
        Name: name,
        DeptYear: deptYear,
        Comment: comment,
        Rating: rating,
        CreatedAt: new Date().toLocaleString(),
    });

    // Convert back to worksheet
    worksheet = XLSX.utils.json_to_sheet(data);

    // ✅ Replace existing sheet instead of appending
    workbook.Sheets["Feedbacks"] = worksheet;
    if (!workbook.SheetNames.includes("Feedbacks")) {
        workbook.SheetNames.push("Feedbacks");
    }

    // Save Excel file
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

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
    console.log("📍 POST http://localhost:5000/api/feedback");
    console.log("📍 GET http://localhost:5000/api/feedback/excel");
});