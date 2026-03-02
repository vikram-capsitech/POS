import React, { ReactNode, RefObject } from "react";
import {
  Formik,
  FormikHelpers,
  FormikProps,
} from "formik";
import * as Yup from "yup";
import { Modal, Button, Space } from "antd";

interface ModelFormikProps<T> {
  open: boolean;
  isFooterBtn: boolean;
  isSubModal: boolean;
  title: string;
  onClose: () => void;
  initialValues: T;
  validationSchema: Yup.ObjectSchema<any>;
  innerRef?: RefObject<FormikProps<T>>;
  validateOnChange: boolean;
  onSubmit: (values: T, helpers: FormikHelpers<T>) => void;
  children?: (props: FormikProps<T>) => ReactNode | any;
  validateOnBlur?: boolean;
}

// const IconButton = styled(Button)({
//   "&:hover": {
//     color: "red",
//     fontWeight: 500,
//   },
//   "& .MuiButton-startIcon": {
//     margin: 0,
//   },
//   padding: 0,
//   minWidth: 30,
// });

const ModelFormikComponent = <T extends object>(
  props: React.PropsWithChildren<ModelFormikProps<T>> | any
) => {
  const {
    open,
    onClose,
    isFooterBtn = true,
    isSubModal = false,
    initialValues,
    validationSchema,
    onSubmit,
    children,
    title,
    validateOnChange,
    validateOnBlur,
  } = props;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={validateOnChange}
      validateOnBlur={validateOnBlur}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<any>) => (
        <Modal
          centered
          title={title}
          open={open}
          onCancel={onClose}
          footer={null}
          width={isSubModal ? 600 : undefined}
          style={{ maxHeight: "calc(100vh - 200px)" }}
          bodyStyle={{
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Space style={{ width: "100%" }} align="center">
            {/* <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title> */}
            {/* Close button in the header */}
            {/* <Button
              type="text"
              icon={<CloseOutlined size={20} />}
              onClick={onClose}
              style={{ padding: 0 }}
            /> */}
          </Space>

          {/* Form Children */}
          <div style={{}}>
            {children
              ? typeof children === "function"
                ? (children as (bag: FormikProps<any>) => React.ReactNode)(
                    formikProps
                  )
                : React.Children.only(children)
              : null}
          </div>
          {/* Footer Buttons */}
          {isFooterBtn && (
            <Space
              style={{ width: "100%", justifyContent: "end", marginTop: 10 }}
              align="center"
            >
              <Button onClick={onClose} type="default" style={{ height: 30 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={formikProps.submitForm}
                loading={formikProps.isSubmitting}
                style={{ height: 30 }}
              >
                Submit
              </Button>
            </Space>
          )}
        </Modal>
      )}
    </Formik>
  );
};

export default ModelFormikComponent;
