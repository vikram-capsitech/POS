import React from "react";
import EmployeeAdminForm from "../components/EmployeeAdminForm";
import useStore from "../store/store";
import { addAdmin, updateAdminById } from "../services/api";
import { useParams } from "react-router-dom";

export default function AddAdmin() {
  const { id } = useParams();
  const { admin, getAdminById } = useStore();

  return (
    <EmployeeAdminForm
      type="admin"
      id={id}
      data={admin}
      fetchFn={getAdminById}
      createFn={addAdmin}
      updateFn={updateAdminById}
      redirectPath="/user-profile"
    />
  );
}
