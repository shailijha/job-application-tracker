// Archive: the original in-memory routes, before moving to Postgres.
// Not used by the server. Kept for reference only.
import express from "express";

const router = express.Router();

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

router.get("/applications", (req, res) => {
  const status = req.query.status;
  if (status) {
    const result = applications.filter((application) => application.status === status);
    return res.json(result);
  }
  res.json(applications);
});

router.get("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const application = applications.find((a) => a.id === id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }
  res.json(application);
});

router.post("/applications", (req, res) => {
  const { company, role, status } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "Company and/or role are required" });
  }
  if (status && !applicationStatus.includes(status)) {
    return res.status(400).json({ error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}` });
  }
  const newApplication = {
    id: applications.length + 1, company, role, status: status || "applied",
  };
  applications.push(newApplication);
  res.status(201).json(newApplication);
});

router.patch("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const requestBodyStatus = req.body.status;
  if (!applicationStatus.includes(requestBodyStatus)) {
    return res.status(400).json({ error: `Status is invalid. It needs to be one of these values: ${applicationStatus.join(", ")}` });
  }
  const application = applications.find((a) => a.id === id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }
  application.status = requestBodyStatus;
  res.json(application);
});

router.delete("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }
  applications.splice(index, 1);
  res.status(204).send();
});

export default router;