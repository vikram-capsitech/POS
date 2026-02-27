import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  List,
  ListItemButton,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import FilterIcon from "../assets/taskScreen/FilterIcon.svg";
export default function FilterModal({
  sections = [], // [{ key: 'category', label: 'Category', options: [...] }]
  onApply,
  onClear,
  initialSelected,
  task = false,
  fetchEmployees,
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [activeSection, setActiveSection] = useState(sections?.[0]?.key || "");
  const [selectedOptions, setSelectedOptions] = useState({}); // { category: [], assignTo: [], ... }

  const handleSection = (sectionKey) => setActiveSection(sectionKey);

  // load previous filters when modal opens
  useEffect(() => {
    if (showFilter) {
      setSelectedOptions(initialSelected || {});
    }
  }, [showFilter, initialSelected]);

  const handleSelect = (sectionKey, option) => {
    const current = selectedOptions[sectionKey] || [];
    setSelectedOptions({
      ...selectedOptions,
      [sectionKey]: current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option],
    });
  };

  useEffect(() => {
    if (showFilter && task) {
      fetchEmployees();
    }
  }, [showFilter, task, fetchEmployees]);

  const handleApply = () => {
    onApply && onApply(selectedOptions);
    setShowFilter(false);
  };

  const handleClear = () => {
    setSelectedOptions({});
    onClear && onClear();
  };

  return (
    <>
      <div className="task-actions">
        <div
          className="filter-wrapper"
          // ref={filterDropdownRef}
          style={{ position: "relative" }}
        >
          <Button
            variant="outlined"
            onClick={() => setShowFilter(true)}
            sx={{ textTransform: "none" }}
            className="btn filter"
          >
            <img src={FilterIcon} width={17} height={17} />
            Filter
          </Button>

          <Modal open={showFilter} onClose={() => setShowFilter(false)}>
            <Box
              sx={{
                width: 670,
                height: 510,
                marginTop: 0,
                bgcolor: "white",
                display: "flex",
                overflow: "hidden",
                outline: "none",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Box
                sx={{
                  width: 240,
                  background: "#f8f8f8",
                  borderRight: "1px solid #eee",
                }}
              >
                <List component="nav">
                  {sections.map((sec) => (
                    <ListItemButton
                      key={sec.key}
                      style={{
                        borderBlockEnd: "1px solid #ccc",
                        color: activeSection === sec.key ? "black" : "#ccc",
                        borderLeft:
                          activeSection === sec.key
                            ? "5px solid blue"
                            : "5px solid transparent",
                      }}
                      onClick={() => handleSection(sec.key)}
                    >
                      {sec.label}
                    </ListItemButton>
                  ))}
                </List>
              </Box>

              <Box sx={{ flexGrow: 1, p: 2, position: "relative" }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontSize: "2rem", fontWeight: 600 }}
                >
                  Filter
                </Typography>

                {sections.map(
                  (sec) =>
                    activeSection === sec.key && (
                      <Box
                        key={sec.key}
                        sx={{
                          mb: 1,
                          display: "flex",
                          flexDirection: "column",
                          "& .MuiFormControlLabel-label": {
                            fontSize: "1.5rem",
                          },
                          maxHeight: "36rem",
                          overflowY: "auto",
                        }}
                      >
                        {sec.type === "month" ? (
                          <input
                            type="month"
                            className="input"
                            value={selectedOptions[sec.key] || ""}
                            onChange={(e) =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [sec.key]: e.target.value,
                              }))
                            }
                            style={{
                              maxWidth: "220px",
                              marginTop: "10px",
                            }}
                          />
                        ) : (
                          (sec.dynamicOptions ?? sec.options).map((opt) => {
                            const value = opt._id ?? opt.value ?? opt; // for dynamicOptions or static options
                            const label = opt.name ?? opt.label ?? opt;

                            return (
                              <FormControlLabel
                                key={value}
                                control={
                                  <Checkbox
                                    checked={(
                                      selectedOptions[sec.key] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      handleSelect(sec.key, value)
                                    }
                                  />
                                }
                                label={label}
                              />
                            );
                          })
                        )}
                      </Box>
                    ),
                )}

                {/* CLOSE BUTTON */}
                <Button
                  onClick={() => setShowFilter(false)}
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    fontSize: 18,
                    minWidth: 0,
                    color: "black",
                  }}
                >
                  ✕
                </Button>

                {/* ACTION BUTTONS */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    right: 20,
                    width: "calc(100% - 40px)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    className="btn filter"
                    onClick={handleClear}
                    sx={{ textTransform: "none" }}
                  >
                    Clear all
                  </Button>
                  <Button
                    variant="contained"
                    className="btn create"
                    onClick={handleApply}
                    sx={{ fontSize: "1.5rem", textTransform: "none" }}
                  >
                    Apply filter
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>
        </div>
      </div>
    </>
  );
}
