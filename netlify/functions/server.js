import { Client } from "pg";

export default async (req, res) => {
    if (req.method === "OPTIONS") {
        // Handle CORS preflight
        return res.status(200).json({});
    }

    if (req.method === "POST") {
        const { regNo, name, deptYear, comment, rating } = req.body;

        if (!regNo || !name || !deptYear || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        try {
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }, // Neon requires SSL
            });

            await client.connect();

            await client.query(
                `INSERT INTO feedbacks (regno, name, deptyear, comment, rating, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [regNo, name, deptYear, comment, rating, new Date().toISOString()]
            );

            await client.end();

            return res.status(200).json({ message: "✅ Feedback saved!" });
        } catch (err) {
            console.error("❌ Neon DB Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
    }

    if (req.method === "GET") {
        try {
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
            });

            await client.connect();

            const result = await client.query(
                "SELECT * FROM feedbacks ORDER BY created_at DESC"
            );

            await client.end();

            return res.status(200).json(result.rows);
        } catch (err) {
            console.error("❌ Neon DB fetch error:", err);
            return res.status(500).json({ error: "Error fetching feedbacks" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
