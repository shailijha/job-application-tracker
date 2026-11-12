import express from "express"
import { pool } from "./db.js"
const app = express();
app.use(express.json());
const port = 3000;
const applicationStatus = ["applied", "interviewing", "offer", "rejected"] as const;
type Application = {
    id: number;
    company: string;
    role: string;
    status: (typeof applicationStatus)[number];
};
const applications: Application[] = [
  { id: 1, company: "Capital One", role: "Software Engineer", status: "applied" },
  { id: 2, company: "Fidelity", role: "Front-End Developer", status: "interviewing" },
];
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
})
// app.get("/applications", (req, res) => {
//     const status = req.query.status;
//     if(status)
//     {
//         const result = applications.filter((application) => application.status === status);
//         return res.json(result);
//     }  
//   res.json(applications);
// });
app.get("/applications", async (_req, res) => {
    const result = await pool.query("SELECT * FROM applications ORDER BY id");
    res.json(result.rows);
})
// app.get("/applications/:id", (req, res) => {
//   const id = Number(req.params.id);
//   const application = applications.find((app) => app.id === id);

//   if (!application) {
//     return res.status(404).json({ error: "Application not found" });
//   }

//   res.json(application);
// });
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
// app.post("/applications", (req, res) => {
//     const {company, role, status } = req.body;
//     if(!company || !role) {
//         return res.status(400).json({error: "Company and/or role are required"});
//     }
//     if(status && !applicationStatus.includes(status)) {
//         return res.status(400).json({error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}`});
//     }
//     const newApplication = {
//         id: applications.length+1, company, role, status: status || "applied"
//     };
//     applications.push(newApplication);
//     res.status(201).json(newApplication);
// });
app.post("/applications", async (req, res) => {
    const {company, role, status } = req.body;
    if(!company || !role ) {
        return res.status(400).json({error: "Company and/or role are required"});
    }
    if(status && !applicationStatus.includes(status)) {
        return res.status(400).json({error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}`});
    }
    const result = await pool.query("INSERT INTO applications (COMPANY, ROLE, STATUS) VALUES ($1, $2, $3) RETURNING *", [company, role, status || "applied"]);
    console.log(result);
    res.status(201).json(result.rows[0]);
});
app.patch("/applications/:id", (req, res) => {
    const id = Number(req.params.id);
    const requestBodyStatus = req.body.status;
    if(!applicationStatus.includes(requestBodyStatus)) {
        return res.status(400).json({error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}`});
    }

    const application = applications.find((a) => a.id === id);

    if(!application) {
        return res.status(404).json({ error: "Application not found" });
    }

    application.status = requestBodyStatus;
    res.json(application);
});
app.delete("/applications/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = applications.findIndex((a) => a.id === id);
    if(index === -1) {
        return res.status(404).json({error: "Application not found"});
    }
    applications.splice(index,1);
    res.status(204).send();
});
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
});