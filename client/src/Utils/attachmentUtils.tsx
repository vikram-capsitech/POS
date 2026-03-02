import { useState } from "react";
import { Avatar, Col, Divider, List, Row, Typography } from "antd";
import { FileIcon, FilesIcon, VideosIcon } from "../Assets/CustomAntIcons";
import { useTheme } from "../Contexts/ThemeContext";
import {
  Folder,
  MoveLeft,
  MoveRight,
  Image,
  FileVideo,
  Link,
} from "lucide-react";

const { Title, Text } = Typography;

const CategorizeAttachments = (
  attachments: any[],
  theme: any,
  themeType: string
) => {
  const images = attachments.filter((att) => att.fileType === "image");
  const videos = attachments.filter((att) => att.fileType === "video");
  const files = attachments.filter((att) => att.fileType === "file");
  const links = attachments.filter((att) => att.fileType === "link");

  const categories = [
    {
      key: "Files",
      icon: (
        <Folder
          strokeWidth={1.5}
          size={20}
          stroke={
            themeType === "light"
              ? theme.light.primaryText
              : theme.dark.primaryText
          }
        />
      ),
      count: files.length,
      items: files,
    },
    {
      key: "Images",
      icon: (
        <Image
          strokeWidth={1.5}
          size={20}
          stroke={
            themeType === "light"
              ? theme.light.primaryText
              : theme.dark.primaryText
          }
        />
      ),
      count: images.length,
      items: images,
    },
    {
      key: "Videos",
      icon: (
        <FileVideo
          strokeWidth={1.5}
          size={20}
          stroke={
            themeType === "light"
              ? theme.light.primaryText
              : theme.dark.primaryText
          }
        />
      ),
      count: videos.length,
      items: videos,
    },
    {
      key: "Links",
      icon: (
        <Link
          strokeWidth={1.5}
          size={20}
          stroke={
            themeType === "light"
              ? theme.light.primaryText
              : theme.dark.primaryText
          }
        />
      ),
      count: links.length,
      items: links,
    },
  ];

  return { images, videos, files, links, categories };
};

interface AttachmentViewerProps {
  attachments: any[];
  showCategorized: boolean;
  setShowCategorized: (showCategorized: boolean) => void;
}

export const AttachmentViewer = ({
  attachments,
  showCategorized,
  setShowCategorized,
}: AttachmentViewerProps) => {
  const { theme, themeType } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Images");
  const { images, videos, files, links, categories } = CategorizeAttachments(
    attachments,
    theme,
    themeType
  );

  const handleToggleView = () => {
    setShowCategorized(((prev: boolean) => !prev) as any);
  };

  return (
    <div style={{ padding: "0px 20px" }}>
      <Row justify="space-between" align="middle" style={{ marginTop: "10px" }}>
        <Col>
          <Title
            level={5}
            style={{
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Shared Files
          </Title>
        </Col>

        {/* Toggle Button */}
        <div
          onClick={handleToggleView}
          style={{
            textAlign: "center",
            padding: "12px",
            cursor: "pointer",
            color:
              themeType === "light"
                ? theme.light.primaryText
                : theme.dark.primaryText,
          }}
        >
          {showCategorized ? (
            <MoveLeft strokeWidth={1} />
          ) : (
            <MoveRight strokeWidth={1} />
          )}
        </div>
      </Row>

      {!showCategorized ? (
        <Row gutter={[16, 16]} justify="start">
          {attachments
            .sort(
              (a: any, b: any) =>
                new Date(b?.attachment?.createdAt).getTime() -
                new Date(a?.attachment?.createdAt).getTime()
            )
            .slice(0, 4)
            .map((attachment: any, index: number) => {
              const fileName =
                attachment?.attachment?.fileName?.toLowerCase() || "";
              const isVideo = [".mp4", ".mov", ".avi", ".mkv", ".webm"].some(
                (ext) => fileName.endsWith(ext)
              );
              const isFile = [".pdf", ".xlsx", ".docx", ".pptx", ".txt"].some(
                (ext) => fileName.endsWith(ext)
              );

              return (
                <Col key={index} span={6}>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "80px",
                    }}
                  >
                    {isFile ? (
                      <FileIcon width={60} height={60} />
                    ) : isVideo ? (
                      <VideosIcon width={60} height={60} />
                    ) : (
                      <Avatar
                        size={60}
                        shape="square"
                        src={attachment?.attachment?.url}
                      />
                    )}
                  </div>
                </Col>
              );
            })}
        </Row>
      ) : (
        <>
          {/* Categories */}
          <Row gutter={[16, 16]} justify="center">
            {categories.map((item) => (
              <Col key={item.key} span={6}>
                <div
                  onClick={() => setSelectedCategory(item.key)}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    background:
                      themeType === "light"
                        ? theme.light.primaryLight
                        : theme.dark.primaryLight,
                    border:
                      selectedCategory === item.key
                        ? `1px solid ${theme.light.primaryText}`
                        : "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ padding: "5px" }}>{item.icon}</div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color:
                        themeType === "light"
                          ? theme.light.primaryText
                          : theme.dark.primaryText,
                    }}
                  >
                    {item.count.toString().padStart(2, "0")}
                  </Text>
                </div>
                <Text
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "center",
                    color:
                      themeType === "light"
                        ? theme.light.primaryText
                        : theme.dark.primaryText,
                  }}
                >
                  {item.key}
                </Text>
              </Col>
            ))}
          </Row>

          <Divider className="custom-divider" />

          {/* Category Content */}
          {selectedCategory === "Images" && (
            <>
              <Title
                level={5}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                Images
              </Title>
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Row gutter={[8, 8]}>
                  {images.map((img: any, index: number) => (
                    <Col span={8} key={index}>
                      <Avatar
                        src={img?.attachment?.url}
                        alt="Shared"
                        size={102}
                        style={{ borderRadius: "6px", width: "100%" }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}

          {selectedCategory === "Videos" && (
            <>
              <Title
                level={5}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                Videos
              </Title>
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Row gutter={[8, 8]}>
                  {videos.map((video: any, index: number) => (
                    <Col span={12} key={index}>
                      <video
                        width="100%"
                        height="100"
                        controls
                        style={{ borderRadius: "5px", objectFit: "cover" }}
                      >
                        <source src={video?.attachment?.url} type="video/mp4" />
                      </video>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}

          {selectedCategory === "Files" && (
            <>
              <Title
                level={5}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                Files
              </Title>
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <List
                  dataSource={files}
                  renderItem={(file: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <FilesIcon
                            style={{
                              color:
                                themeType === "light"
                                  ? theme.light.textHilight
                                  : theme.dark.textHilight,
                            }}
                          />
                        }
                        title={
                          <a
                            href={file?.attachment?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color:
                                themeType === "light"
                                  ? theme.light.textHilight
                                  : theme.dark.textHilight,
                            }}
                          >
                            {file?.attachment?.fileName || "Download File"}
                          </a>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </>
          )}

          {selectedCategory === "Links" && (
            <>
              <Title
                level={5}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                Links
              </Title>
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <List
                  dataSource={links}
                  renderItem={(link: any) => (
                    <List.Item>
                      <a
                        href={link?.attachment?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link?.attachment?.url}
                      </a>
                    </List.Item>
                  )}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
