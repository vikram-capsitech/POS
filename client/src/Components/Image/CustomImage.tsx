import { Image, Tooltip } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { ToolbarRenderInfoType } from "rc-image/lib/Preview";

const CustomImage = ({ file, onClose }: any) => {
  return (
    <Image.PreviewGroup
      preview={{
        visible: true,
        onVisibleChange: () => {
          onClose(true);
        },
        toolbarRender: (originalNode: any, info: ToolbarRenderInfoType) => {
          const { actions, current = 0 } = info;

          return (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Tooltip title="Zoom In">
                <ZoomInOutlined
                  style={{ fontSize: 20, color: "white", cursor: "pointer" }}
                  onClick={actions.onZoomIn}
                />
              </Tooltip>
              <Tooltip title="Zoom Out">
                <ZoomOutOutlined
                  style={{ fontSize: 20, color: "white", cursor: "pointer" }}
                  onClick={actions.onZoomOut}
                />
              </Tooltip>
              <Tooltip title="Rotate Left">
                <RotateLeftOutlined
                  style={{ fontSize: 20, color: "white", cursor: "pointer" }}
                  onClick={actions.onRotateLeft}
                />
              </Tooltip>
              <Tooltip title="Rotate Right">
                <RotateRightOutlined
                  style={{ fontSize: 20, color: "white", cursor: "pointer" }}
                  onClick={actions.onRotateRight}
                />
              </Tooltip>

              {/* Custom Download Icon */}
              <Tooltip title="Download">
                <a href={file.url} download={`image-${current + 1}.jpg`}>
                  <DownloadOutlined style={{ fontSize: 20, color: "white" }} />
                </a>
              </Tooltip>
            </div>
          );
        },
      }}
    >
      <Image
        src={file.url}
        style={{ display: "none" }}
        onClick={() => onClose(true)}
      />
    </Image.PreviewGroup>
  );
};

export default CustomImage;
