import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: "postgresql://localhost:5432/job_tracker",
});