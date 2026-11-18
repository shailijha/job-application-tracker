import express from "express"
import { pool } from "./db.js"
const app = express();
app.use(express.json());
const port = 3000;
const applicationStatus = ["applied", "interviewing", "offer", "rejected"] as const;

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
})

app.get("/applications", async (_req, res) => {
    const result = await pool.query("SELECT * FROM applications ORDER BY id");
    res.json(result.rows);
})

app.get("/applications/:id", async (req, res) => {
    const id = Number(req.params.id)
    if(id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({ error: "Please provide a valid id" })
    }

    const application = await pool.query("SELECT * FROM applications WHERE id = $1",[id]);

    if(application.rows.length == 0) {
        return res.status(404).json({ error: "Application not found" });
    }
    res.json(application.rows[0]); 
})

app.post("/applications", async (req, res) => {
    const {company, role, status } = req.body;
    if(!company || !role ) {
        return res.status(400).json({error: "Company and/or role are required"});
    }
    if(status && !applicationStatus.includes(status)) {
        return res.status(400).json({error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}`});
    }
    const result = await pool.query("INSERT INTO applications (COMPANY, ROLE, STATUS) VALUES ($1, $2, $3) RETURNING *", [company, role, status || "applied"]);
    res.status(201).json(result.rows[0]);
});

app.patch("/applications/:id", async (req, res) => {
    const id = Number(req.params.id);
    const requestBodyStatus = req.body.status;
    if(id <= 0 || !Number.isInteger(id)) {
        return res.status(400). json({error: 'Please provide a valid ID'});
    }

    if(!applicationStatus.includes(requestBodyStatus)) {
        return res.status(400).json({error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}`});
    }

    const result = await pool.query("UPDATE applications SET status = $1 WHERE id = $2 RETURNING *", [requestBodyStatus, id]);
    if(result.rowCount === 0) {
        return res.status(404).json({ error: "Application not found" });
    }
    res.json(result.rows[0]);
});

app.delete("/applications/:id", async (req, res) => {
    const id = Number(req.params.id);
    if(id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({error: 'Please provide a valid ID'});
    }

    const result = await pool.query("DELETE FROM applications WHERE id = $1", [id]);
    if(result.rowCount === 0) {
        return res.status(404).json({error: "Application not found"});
    }
    res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
});