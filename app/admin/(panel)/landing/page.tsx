import { fetchLandingContentForAdmin } from "../../actions";
import LandingContentEditor from "./LandingContentEditor";

export default async function AdminLandingContentPage() {
  const { landing_content, setupHint } = await fetchLandingContentForAdmin();
  return (
    <LandingContentEditor initial={landing_content.content} setupHint={setupHint} />
  );
}
