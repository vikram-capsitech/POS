import { useParams } from "react-router-dom";

import UserProfile from "../components/UserProfileDetails";
import ManagerProfile from "../components/managerProfie";

export default function StaffProfileDetails() {
  const { role, id } = useParams();
  if (role === "staff" ||role==="admins") {
    return <UserProfile role={role} id={id} />;
  }
  if (role === "manager") {
    return <ManagerProfile role={role} id={id} />;
  }
}
