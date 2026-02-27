
import { useParams} from "react-router-dom";

import IssueDetails from "../components/IssueDetails";
import LeaveDetails from "../components/LeaveDetails";
import AdvanceDetails from "../components/AdvanceDetails";

export default function RequestDetails() {
  const { type, id } = useParams();
   if (type === "leave") return <LeaveDetails id={id} />;
   if(type ==="advance") return < AdvanceDetails id={id}/>;
}
