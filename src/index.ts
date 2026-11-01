import express from "express"
import error = require("node:console");
import console = require("node:console");
const app = express();
app.use(express.json());
const port = 3000;
const applications = [
  { id: 1, company: "Capital One", role: "Software Engineer", status: "applied" },
  { id: 2, company: "Fidelity", role: "Front-End Developer", status: "interviewing" },
];
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
})
app.get("/applications", (req, res) => {
    const status = req.query.status;
    if(status)
    {
        const result = applications.filter((application) => application.status === status);
        return res.json(result);
    }  
  res.json(applications);
});
app.get("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const application = applications.find((app) => app.id === id);

  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  res.json(application);
});
app.post("/applications", (req, res) => {
    const {company, role, status } = req.body;
    if(!company || ! role) {
        return res.status(400).json({error: "Company and/or role are required"});
    }

    const newApplication = {
        id: applications.length+1, company, role, status: status || "applied"
    };
    applications.push(newApplication);
    res.status(201).json(newApplication);
});
app.patch("/applications/:id", (req, res) => {
    const id = Number(req.params.id);
    const requestBodyStatus = req.body.status;
    if(!requestBodyStatus) {
        return res.status(400).json({error: "Status cannot be empty"});
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