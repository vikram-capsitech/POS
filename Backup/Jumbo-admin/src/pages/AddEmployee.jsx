import EmployeeAdminForm from "../components/EmployeeAdminForm";
import useStore from "../store/store";
import { addEmployee, updateEmployee } from "../services/api";
import { useParams } from "react-router-dom";

export default function AddEmployee() {
  const { id } = useParams();
  const { staff, getIndividualStaff } = useStore();

  return (
    <EmployeeAdminForm
      key={id}
      type="employee"
      id={id}
      data={staff}
      fetchFn={getIndividualStaff}
      createFn={addEmployee}
      updateFn={updateEmployee}
      redirectPath="/user-profile"
    />
  );
}
