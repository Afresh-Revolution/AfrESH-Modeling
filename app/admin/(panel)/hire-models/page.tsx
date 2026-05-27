import type { HireModel } from "@/lib/types";
import { fetchHireModelsJson } from "../../actions";
import HireModelsClient from "./HireModelsClient";

export default async function AdminHireModelsPage() {
  const { hire_models } = await fetchHireModelsJson();

  return (
    <HireModelsClient
      initialHireModels={hire_models as (HireModel & { id: string })[]}
      setupHint={null}
    />
  );
}