
"use client"
import React, { useState, useRef, useCallback } from "react";
import { Upload, Button, message, Slider, Space } from "antd";
import { UploadOutlined, RotateRightOutlined, DownloadOutlined } from "@ant-design/icons";
import Cropper from "react-easy-crop";

const ImageCropper = ({ imageSrc, onCropComplete, rotation, setRotation }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  return (
    <>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onCropComplete={onCropComplete}
      />
    </>
  );
};

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const cropRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    cropRef.current = croppedAreaPixels;
  }, []);


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

  const handleCrop = async () => {
    if (!cropRef.current || !selectedImage) return;
    const croppedImg = await getCroppedImg(selectedImage, cropRef.current, rotation);
    setCroppedImage(croppedImg);
  };

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
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
      {/* <h2>React Image Crop & Rotate</h2> */}
      <Upload beforeUpload={() => false} onChange={handleImageUpload} showUploadList={false} accept="image/*">
        <Button icon={<UploadOutlined />} type="primary">Upload Image</Button>
      </Upload>


      {selectedImage && (
        <>
          <div style={{ position: "relative", width: 400, height: 400, margin: "20px auto", border: "1px solid #ddd" }}>
            <ImageCropper
              imageSrc={selectedImage}
              onCropComplete={onCropComplete}
              rotation={rotation}
              setRotation={setRotation}
            />
          </div>
          <Space>
            <Button onClick={handleRotate}>Rotate 90°</Button>
            <Button onClick={handleCrop}>Crop Image</Button>
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
          <Button onClick={handleDownload}>Download Image</Button>
        </>
      )}
    </div>
  );
};

// ✅ Function to get cropped image with correct rotation
async function getCroppedImg(imageSrc, crop, rotation) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (crop.width === 0 || crop.height === 0) {
    console.error("Invalid crop dimensions", crop);
    return null;
  }

  const rotRad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rotRad));
  const cos = Math.abs(Math.cos(rotRad));

  const newWidth = image.width * cos + image.height * sin;
  const newHeight = image.width * sin + image.height * cos;
  canvas.width = newWidth;
  canvas.height = newHeight;

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  if (crop.width > 0 && crop.height > 0) {
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = crop.width;
    croppedCanvas.height = crop.height;
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
      canvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return croppedCanvas.toDataURL("image/png");
  } else {
    console.error("Invalid crop area");
    return null;
  }
}

export default App;
