import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // replaces body-parser

const NEON_API_URL = "https://ep-snowy-tree-ajjbtg0y.apirest.c-3.us-east-2.aws.neon.tech/neondb/rest/v1";
const NEON_API_KEY = process.env.NEON_API_KEY;

app.get("/", (req, res) => {
    res.send("✅ Feedback backend with Neon REST API is running!");
});

app.post("/api/feedback", async (req, res) => {
    const { regNo, name, deptYear, comment, rating } = req.body;
    if (!regNo || !name || !deptYear || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const response = await fetch(`${NEON_API_URL}/feedbacks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NEON_API_KEY}`,
            },
            body: JSON.stringify({
                regno: regNo,
                name,
                deptyear: deptYear,
                comment,
                rating,
                created_at: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Neon API error: ${response.status} - ${errorText}`);
        }

        res.json({ message: "Feedback saved to Neon REST ✓" });
    } catch (err) {
        console.error("❌ Neon REST Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.get("/api/feedback", async (req, res) => {
    try {
        const response = await fetch(`${NEON_API_URL}/feedbacks?order=created_at.desc`, {
            headers: { "Authorization": `Bearer ${NEON_API_KEY}` },
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Neon REST fetch error:", err);
        res.status(500).send("Error fetching feedbacks");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});