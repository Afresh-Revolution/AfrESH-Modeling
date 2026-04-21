import { parseSiteMetricsRow } from "@/lib/siteMetrics";
import { fetchSiteMetricsForAdmin } from "../../actions";
import { MetricsEditor } from "./MetricsEditor";

export default async function AdminMetricsPage() {
  const { metrics } = await fetchSiteMetricsForAdmin();
  const initial = parseSiteMetricsRow(metrics as Record<string, unknown>);
  return <MetricsEditor initial={initial} />;
}
