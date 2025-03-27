"use client"
import React, { useState, useRef, useCallback } from "react";
import { Upload, Button, message, Space } from "antd";
import { UploadOutlined, RotateRightOutlined, DownloadOutlined } from "@ant-design/icons";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);

  const handleImageUpload = (info) => {
    const file = info.file;
    if (!file) {
      message.error("No file detected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      message.success("Image uploaded successfully!");
    };
    reader.onerror = () => message.error("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async () => {
    if (!imageRef.current) return;
    const croppedImg = await getCroppedImg(imageRef.current, crop, rotation);
    setCroppedImage(croppedImg);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!croppedImage) return;
    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "cropped-image.png";
    link.click();
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <Upload beforeUpload={() => false} onChange={handleImageUpload} showUploadList={false} accept="image/*">
        <Button icon={<UploadOutlined />} type="primary">Upload Image</Button>
      </Upload>

      {selectedImage && (
        <>
          <div style={{ width: "100%", maxWidth: 400, margin: "20px auto", position: "relative" }}>
            <ReactCrop src={selectedImage} crop={crop} onChange={setCrop} onComplete={handleCropComplete}>
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Crop Preview"
                style={{ transform: `rotate(${rotation}deg)`, maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
          <Space>
            <Button onClick={handleRotate} icon={<RotateRightOutlined />}>Rotate 90°</Button>
            <Button onClick={handleCropComplete}>Crop Image</Button>
          </Space>
        </>
      )}

      <br />
      <h3>Preview</h3>
      <br />

      {croppedImage && (
        <>
          <img src={croppedImage} alt="Cropped Preview" style={{ width: "100%", maxWidth: 300, border: "1px solid #ddd", borderRadius: 10 }} />
          <br />
          <Button onClick={handleDownload} icon={<DownloadOutlined />}>Download Image</Button>
        </>
      )}
    </div>
  );
};

async function getCroppedImg(image, crop, rotation) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelCrop = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };

  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d");

  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));
  const rotatedWidth = image.naturalWidth * cos + image.naturalHeight * sin;
  const rotatedHeight = image.naturalWidth * sin + image.naturalHeight * cos;

  offCanvas.width = rotatedWidth;
  offCanvas.height = rotatedHeight;
  offCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  offCtx.rotate(rotRad);
  offCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    offCanvas,
    (offCanvas.width - image.naturalWidth) / 2 + pixelCrop.x,
    (offCanvas.height - image.naturalHeight) / 2 + pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

export default App;