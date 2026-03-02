import { Avatar, Button, Empty, Input, Modal, Spin, Table, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "../Contexts/ThemeContext";
import { toast } from "react-toastify";
import { searchMessage } from "../Api";
import { requestHandler } from "../Utils";
import { Download, File, FileVideo, Link } from "lucide-react";
import { mergeStyles } from "@fluentui/merge-styles";

export const SearchMessageModal = ({
  isOpen,
  onClose,
  searchResults: initialResults,
  fileResults: initialFiles,
  initialSearchTerm,
}: any) => {
  const { currentChat } = useSelector((state: any) => state.chat);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState(initialResults);
  const [fileResults, setFileResults] = useState(initialFiles);
  const [loading, setLoading] = useState(false);
  const { theme, themeType } = useTheme();

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setSearchResults(initialResults);
    setFileResults(initialFiles);
  }, [initialSearchTerm, initialResults, initialFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchInModal = async () => {
    if (!searchTerm.trim()) {
      toast.warning("Please enter a search term.");
      return;
    }
    setLoading(true);
    await requestHandler(
      async () => await searchMessage(currentChat?._id, searchTerm),
      null,
      (res: any) => {
        if (res?.data) {
          setSearchResults(res.data.messages || []);
          setFileResults(res.data.files || []);
        } else {
          setSearchResults([]);
          setFileResults([]);
        }
      },
      () => {
        toast.error("Error");
      }
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setFileResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      handleSearchInModal();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const urlRegex = /https?:\/\/[^\s]+/;

  const searchResultsWithUrls = searchResults
    .filter(
      (item: any) =>
        typeof item.content === "string" && urlRegex.test(item.content)
    )
    .map((item: any) => {
      return {
        key: item._id,
        fileType: "link",
        fileName: item.fileName || item.content,
        fileUrl: item.fileUrl,
        thumbnailUrl: item.thumbnailUrl,
        createdAt: item.createdAt,
        senderName: item.sender?.userName,
        senderPic: item.sender?.pic,
        content: item.content,
      };
    });

  const columnsLinks = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string, record: any) => (
        <a
          href={record.content}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              strokeWidth={1}
              size={30}
              style={{
                borderRadius: 6,
                padding: "6px",
                background:
                  themeType === "light"
                    ? theme.light.neutralbackground
                    : theme.dark.neutralbackground,
              }}
            />
            {text}
          </span>
        </a>
      ),
    },
    {
      title: "Sent by",
      key: "senderName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={record.senderPic} />
          <span>{record.senderName}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  const mergedData = [...fileResults, ...searchResults].map((item: any) => {
    const isSearchResult = !!item.sender?.userName;
    const hasUrlInContent =
      typeof item.content === "string" && urlRegex.test(item.content);

    return {
      key: item._id,
      fileType: hasUrlInContent ? "link" : item.fileType || item.type,
      fileName: item.fileName || item.content,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl,
      createdAt: item.createdAt,
      senderName: isSearchResult ? item.sender?.userName : item.senderName,
      senderPic: isSearchResult ? item.sender?.pic : item.senderPic,
      content: item.content,
      isSearchResult,
    };
  });

  const columnsRecent = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <>
            {record.fileType === "file" ? (
              <File
                strokeWidth={1}
                size={30}
                style={{
                  borderRadius: 6,
                  padding: "6px",
                  background:
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground,
                }}
              />
            ) : record.fileType === "image" ? (
              <Avatar
                shape="square"
                src={record.thumbnailUrl || record.fileUrl}
              />
            ) : record.fileType === "link" ? (
              <Link
                strokeWidth={1}
                size={30}
                style={{
                  borderRadius: 6,
                  padding: "6px",
                  background:
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground,
                }}
              />
            ) : record.fileType === "video" ? (
              <FileVideo
                strokeWidth={1}
                size={30}
                style={{
                  borderRadius: 6,
                  padding: "6px",
                  background:
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground,
                }}
              />
            ) : null}
          </>

          {record.fileType === "link" ? (
            <a
              href={record.content}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0B63F8" }}
            >
              {record.content.length > 40
                ? `${record.content.slice(0, 40)}...`
                : record.content}
            </a>
          ) : (
            <span style={{}}>{record.fileName}</span>
          )}
        </div>
      ),
    },
    {
      title: "Sent by",
      key: "senderName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={record.senderPic} />
          <span>{record.senderName}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </span>
          {record.fileUrl && (
            <div className="download-icon" style={{ marginLeft: 8 }}>
              <Button
                icon={
                  <Download
                    strokeWidth={1}
                    size={25}
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      padding: "6px",
                      borderRadius: 6,
                      background:
                        themeType === "light"
                          ? theme.light.neutralbackground
                          : theme.dark.neutralbackground,
                    }}
                  />
                }
                size="small"
                type="text"
                onClick={() => window.open(record.fileUrl, "_blank")}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const fileOnlyData = fileResults
    .filter((item: any) => {
      const fileName = item.fileName?.toLowerCase() || "";
      return (
        item.fileType === "file" &&
        (fileName.endsWith(".pdf") ||
          fileName.endsWith(".ppt") ||
          fileName.endsWith(".pptx") ||
          fileName.endsWith(".xlsx"))
      );
    })
    .map((item: any) => ({
      key: item._id,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      senderName: item.senderName,
      senderPic: item.senderPic,
      createdAt: item.createdAt,
      size: item.size,
    }));

  const columnsFiles = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <File
            strokeWidth={1}
            size={30}
            style={{
              borderRadius: 6,
              padding: "6px",
              background:
                themeType === "light"
                  ? theme.light.neutralbackground
                  : theme.dark.neutralbackground,
            }}
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: number) => `${(size / (1024 * 1024)).toFixed(2)} MB`,
    },
    {
      title: "Sent by",
      key: "senderName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={record.senderPic} />
          <span>{record.senderName}</span>
        </div>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </span>
          {record.fileUrl && (
            <div className="download-icon" style={{ marginLeft: 8 }}>
              <Button
                icon={
                  <Download
                    strokeWidth={1}
                    size={25}
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      padding: "6px",
                      borderRadius: 6,
                      background:
                        themeType === "light"
                          ? theme.light.neutralbackground
                          : theme.dark.neutralbackground,
                    }}
                  />
                }
                size="small"
                type="text"
                style={{ marginLeft: 8 }}
                onClick={() => window.open(record.fileUrl, "_blank")}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const imageFiles = fileResults
    .filter((item: any) => item.fileType === "image")
    .map((item: any) => ({
      key: item._id,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      senderName: item.senderName,
      senderPic: item.senderPic,
      createdAt: item.createdAt,
      size: item.size,
    }));

  const columnsImage = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={record.thumbnailUrl || record.fileUrl}
            alt={record.fileName}
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              objectFit: "cover",
            }}
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: any) => `${(size / (1024 * 1024)).toFixed(2)} MB`,
    },
    {
      title: "Sent by",
      dataIndex: "senderName",
      key: "senderName",
      render: (text: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={record.senderPic} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </span>
          {record.fileUrl && (
            <div className="download-icon" style={{ marginLeft: 8 }}>
              <Button
                icon={
                  <Download
                    strokeWidth={1}
                    size={25}
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      padding: "6px",
                      borderRadius: 6,
                      background:
                        themeType === "light"
                          ? theme.light.neutralbackground
                          : theme.dark.neutralbackground,
                    }}
                  />
                }
                size="small"
                type="text"
                style={{ marginLeft: 8 }}
                onClick={() => window.open(record.fileUrl, "_blank")}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const VideoOnlyData = fileResults
    .filter((item: any) => {
      const fileName = item.fileName?.toLowerCase() || "";
      return (
        item.fileType === "video" &&
        (fileName.endsWith(".mp4") ||
          fileName.endsWith(".avi") ||
          fileName.endsWith(".webm") ||
          fileName.endsWith(".mkv"))
      );
    })
    .map((item: any) => ({
      key: item._id,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      senderName: item.senderName,
      senderPic: item.senderPic,
      createdAt: item.createdAt,
      size: item.size,
    }));

  const columnsVideo = [
    {
      title: "Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileVideo
            strokeWidth={1}
            size={30}
            style={{
              borderRadius: 6,
              padding: "6px",
              background:
                themeType === "light"
                  ? theme.light.neutralbackground
                  : theme.dark.neutralbackground,
            }}
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: number) => `${(size / (1024 * 1024)).toFixed(2)} MB`,
    },
    {
      title: "Sent by",
      key: "senderName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small" src={record.senderPic} />
          <span>{record.senderName}</span>
        </div>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ flex: 1 }}>
            {new Date(record.createdAt).toLocaleDateString()}
          </span>
          {record.fileUrl && (
            <div className="download-icon" style={{ marginLeft: 8 }}>
              <Button
                icon={
                  <Download
                    strokeWidth={1}
                    size={25}
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      padding: "6px",
                      borderRadius: 6,
                      background:
                        themeType === "light"
                          ? theme.light.neutralbackground
                          : theme.dark.neutralbackground,
                    }}
                  />
                }
                size="small"
                type="text"
                style={{ marginLeft: 8 }}
                onClick={() => window.open(record.fileUrl, "_blank")}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      maskClosable={false}
      closable={true}
      title={
        <div
          style={{
            fontWeight: "600",
            fontSize: "18px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        >
          Search
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        content: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
        },
        header: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
        },
        body: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
        },
      }}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Recent
            </span>
          }
          key="1"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              columns={columnsRecent}
              className={mergeStyles({
                // ".ant-table-thead": {
                //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                // },
                ".ant-table-thead > tr > th": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-tbody": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                },
                ".ant-table-tbody > tr > td": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                  borderBottom: "none !important",
                },
                ".ant-empty-description": {
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-cell::before": {
                  display: "none !important", // Hides internal separator pseudo-element
                },
                ".ant-table-thead > tr > th:last-child": {
                  boxShadow: "none !important",
                },
              })}
              size="small"
              dataSource={mergedData.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )}
              pagination={false}
              rowClassName={() => "file-row"}
            />
          </Spin>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Files
            </span>
          }
          key="2"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              columns={columnsFiles}
              dataSource={fileOnlyData}
              pagination={false}
              className={mergeStyles({
                // ".ant-table-thead": {
                //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                // },
                ".ant-table-thead > tr > th": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-tbody": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                },
                ".ant-table-tbody > tr > td": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                  borderBottom: "none !important",
                },
                ".ant-empty-description": {
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-cell::before": {
                  display: "none !important", // Hides internal separator pseudo-element
                },
                ".ant-table-thead > tr > th:last-child": {
                  boxShadow: "none !important",
                },
              })}
              size="small"
              showHeader
              rowClassName={() => "file-row"}
            />
          </Spin>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Images
            </span>
          }
          key="3"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              columns={columnsImage}
              dataSource={imageFiles}
              rowKey="_id"
              className={mergeStyles({
                // ".ant-table-thead": {
                //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                // },
                ".ant-table-thead > tr > th": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-tbody": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                },
                ".ant-table-tbody > tr > td": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                  borderBottom: "none !important",
                },
                ".ant-empty-description": {
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-cell::before": {
                  display: "none !important", // Hides internal separator pseudo-element
                },
                ".ant-table-thead > tr > th:last-child": {
                  boxShadow: "none !important",
                },
              })}
              size="small"
              pagination={false}
              rowClassName={() => "file-row"}
            />
          </Spin>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Videos
            </span>
          }
          key="4"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              columns={columnsVideo}
              dataSource={VideoOnlyData}
              pagination={false}
              className={mergeStyles({
                // ".ant-table-thead": {
                //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                // },
                ".ant-table-thead > tr > th": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-tbody": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                },
                ".ant-table-tbody > tr > td": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                  borderBottom: "none !important",
                },
                ".ant-empty-description": {
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-cell::before": {
                  display: "none !important", // Hides internal separator pseudo-element
                },
                ".ant-table-thead > tr > th:last-child": {
                  boxShadow: "none !important",
                },
              })}
              size="small"
              showHeader
              rowClassName={() => "file-row"}
            />
          </Spin>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Text
            </span>
          }
          key="5"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              className="custom-input"
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <div
              style={{ padding: "10px 0", maxHeight: 400, overflowY: "auto" }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((message: any) => (
                  <div
                    key={message._id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "12px 0",
                      //borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      size={32}
                      src={message.sender?.pic}
                      style={{ marginRight: 12, marginTop: 2 }}
                    />

                    {/* Message Content */}
                    <div style={{ flex: 1 }}>
                      {/* Sender Name & Time */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            marginRight: 8,
                            color:
                              themeType === "light"
                                ? theme.light.textHilight
                                : theme.dark.textHilight,
                          }}
                        >
                          {message.sender?.userName || "Unknown"}
                        </span>
                        <span style={{ fontSize: 12, color: "#999" }}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Message Text */}
                      <div>
                        <span
                          style={{
                            fontSize: 14,
                            color:
                              themeType === "light"
                                ? theme.light.textHilight
                                : theme.dark.textHilight,
                          }}
                        >
                          {message.content}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  description="No text messages found"
                  className={mergeStyles({
                    ".ant-empty-description": {
                      color: `${
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight
                      } !important`,
                    },
                  })}
                />
              )}
            </div>
          </Spin>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Links
            </span>
          }
          key="6"
        >
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              className="custom-input"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              styles={{
                input: {
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                },
              }}
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              style={{
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                color:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
              }}
              className={mergeStyles({
                // ".ant-table-thead": {
                //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                // },
                ".ant-table-thead > tr > th": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.neutralbackground
                      : theme.dark.neutralbackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-tbody": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                },
                ".ant-table-tbody > tr > td": {
                  backgroundColor: `${
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground
                  } !important`,
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                  borderBottom: "none !important",
                },
                ".ant-empty-description": {
                  color: `${
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  } !important`,
                },
                ".ant-table-cell::before": {
                  display: "none !important", // Hides internal separator pseudo-element
                },
                ".ant-table-thead > tr > th:last-child": {
                  boxShadow: "none !important",
                },
              })}
              size="small"
              columns={columnsLinks}
              dataSource={searchResultsWithUrls}
              pagination={false}
            />
          </Spin>
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="People" key="7">
          <div style={{ padding: "0 0 16px 0" }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={handleChange}
              onPressEnter={handleSearchInModal}
              allowClear
              style={{
                borderRadius: 10,
                minHeight: 36,
                fontSize: 14,
              }}
            />
          </div>
          <Spin spinning={loading}>
            <Table
              dataSource={filteredData}
              columns={columnsPeople}
              pagination={false}
            />
          </Spin>
        </Tabs.TabPane> */}
      </Tabs>
    </Modal>
  );
};
