import type { HireModel } from "@/lib/types";
import { hireModelsStorageReady } from "@/lib/adminHireModels";
import { fetchHireModelsJson } from "../../actions";
import HireModelsClient from "./HireModelsClient";

export default async function AdminHireModelsPage() {
  const { hire_models } = await fetchHireModelsJson();
  const setupHint = hireModelsStorageReady()
    ? null
    : "Add DATABASE_URL to your .env (same Postgres as the API), run the hire_models migration in onyxx-backend/sql/schema.sql, then restart Next.js. Until then, creates may fail because the live API does not expose hire-models yet.";

  return (
    <HireModelsClient
      initialHireModels={hire_models as (HireModel & { id: string })[]}
      setupHint={setupHint}
    />
  );
}