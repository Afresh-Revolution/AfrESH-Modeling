import { fetchRosterJson } from "../../actions";
import RosterClient from "./RosterClient";

export default async function AdminRosterPage() {
  const { roster, loadError } = await fetchRosterJson();
  return <RosterClient initialRoster={roster} loadError={loadError} />;
}
