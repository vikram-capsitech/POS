import { getAvailableUsers } from "../Api";
import { requestHandler } from "../Utils";
import AsyncSelect from "react-select/async";
import { debounce } from "lodash";
import { showSnackbar } from "../redux/slices/app";
import { dispatch, useSelector } from "../redux/store";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { useTheme } from "../Contexts/ThemeContext";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export const SearchUserInput = ({
  onChange,
  value,
  placeholder,
  isMulti = false,
  border = "none",
  backgroundColor = "fff",
  selectAll = false,
  onManualDeselect,
}: any) => {
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const { theme, themeType } = useTheme();
  const [reload, setReload] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const _loadSuggestions = (query: string, callback: any) => {
    requestHandler(
      async () => await getAvailableUsers(query, currentOrganization?.id),
      null,
      (res) => {
        setReload(false);
        if (res.data) {
          const opt = res.data.map((r: any) => {
            return {
              label: r.userName,
              value: r._id,
              email: r.email,
              pic: r.pic,
            };
          });
          callback(opt);
        } else {
          callback([]);
        }
      },
      (error: string) => {
        setReload(false);
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };

  const loadSuggestions = debounce(_loadSuggestions, 300);

  const handleChange = (selected: any) => {
    onChange(selected);
    if (
      selectAll &&
      onManualDeselect &&
      Array.isArray(selected) &&
      selected.length < allUsers.length
    ) {
      onManualDeselect();
    }
  };

  useEffect(() => {
    if (!selectAll) {
      onChange(isMulti ? [] : null);
    }

    setReload(true);

    if (selectAll) {
      requestHandler(
        async () => await getAvailableUsers("", currentOrganization?.id),
        null,
        (res) => {
          if (res.data) {
            const allUsers = res.data.map((r: any) => ({
              label: r.userName,
              value: r._id,
              email: r.email,
              pic: r.pic,
            }));
            setAllUsers(allUsers);
            onChange(isMulti ? allUsers : allUsers[0] || null);
          }
        },
        (error: string) => {
          dispatch(showSnackbar({ severity: "error", message: error }) as any);
        }
      );
    }
  }, [selectAll, currentOrganization?.id]);

  return (
    <>
      <AsyncSelect
        key={reload ? "reload" : "stable"}
        defaultOptions
        value={value}
        placeholder={placeholder}
        loadOptions={loadSuggestions}
        onChange={handleChange}
        isMulti={isMulti}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => (
            <div style={{ padding: "0 8px", color: "#999" }}>
              <Search
                stroke={
                  themeType === "light" ? theme.light.text : theme.dark.text
                }
                width={15}
                height={15}
              />
            </div>
          ),
        }}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            border: border,
            borderRadius: 10,
            minHeight: 35,
            lineHeight: "16.38px",
            fontSize: "13px",
            fontWeight: 400,
            backgroundColor: backgroundColor,
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            boxShadow: state.isFocused
              ? `0 0 0 2px ${
                  themeType === "light"
                    ? theme.light.primaryLight
                    : theme.dark.primaryLight
                }`
              : "none",
            borderColor: state.isFocused
              ? themeType === "light"
                ? theme.light.border
                : theme.dark.border
              : border,
            "&:hover": {
              borderColor: state.isFocused
                ? themeType === "light"
                  ? theme.light.primaryLight
                  : theme.dark.primaryLight
                : "#ccc",
            },
          }),
          input: (baseStyles) => ({
            ...baseStyles,
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            fontSize: 13,
          }),
          dropdownIndicator: (baseStyles) => ({
            ...baseStyles,
            display: "none",
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            marginTop: 1,
            fontSize: 12,
            boxShadow: "0px 2px 6px 0px #0F1F2F1A",
            backgroundColor:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            padding: "6px",
            // ":hover": {
            //   backgroundColor: "FFFFFF",
            // },
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: "200px",
            overflowY: "auto",
            paddingRight: "4px",
          }),
          option: (base, state) => ({
            ...base,
            padding: "8px",
            fontSize: "13px",
            fontWeight: state.isFocused ? 500 : 400,
            display: "flex",
            alignItems: "center",
            borderRadius: "10px",
            backgroundColor: state.isFocused
              ? themeType === "light"
                ? theme.light.primaryLight
                : theme.dark.primaryLight
              : "transparent",
            color:
              themeType === "light"
                ? theme.light.textLight
                : theme.dark.textLight,
            cursor: "pointer",
          }),

          loadingIndicator: (base) => ({
            ...base,
            display: "none",
          }),
        }}
        formatOptionLabel={(e: any) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            {e.pic ? (
              <img
                src={e.pic}
                alt={e.userName}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  marginRight: 10,
                }}
              />
            ) : (
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ marginRight: 10 }}
              />
            )}
            <span>{e.label}</span>
          </div>
        )}
      />
    </>
  );
};
