import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const OrgLayout = () => {
  const { currentOrganization } = useSelector((state: any) => state.auth);

  if (currentOrganization?.id === undefined) {
    return <Navigate to={`/client/${currentOrganization.id}`} />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default OrgLayout;
