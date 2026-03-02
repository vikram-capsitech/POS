import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @antd
import { Input } from "antd";

// ----------------------------------------------------------------------

RHFTextField.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.node,
} as any;

export default function RHFTextField({ name, helperText, ...other }: any) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div style={{ width: "100%" }}>
          <Input
            {...field}
            size="small"
            value={
              typeof field.value === "number" && field.value === 0
                ? ""
                : field.value
            }
            status={error ? "error" : undefined} 
            {...other}
          />
          {error && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {error.message || helperText}
            </div>
          )}
        </div>
      )}
    />
  );
}
