import { fetchRosterJson } from "../../actions";
import RosterClient from "./RosterClient";

export default async function AdminRosterPage() {
  const { roster } = await fetchRosterJson();
  return <RosterClient initialRoster={roster} />;
}
