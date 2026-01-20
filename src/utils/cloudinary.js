export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  const resourceType = file.type === "application/pdf" ? "image" : "auto";
  formData.append("upload_preset", uploadPreset);
  
  console.log(`Starting upload as ${resourceType}...`, { cloudName: cloudName ? "Present" : "Missing", preset: uploadPreset ? "Present" : "Missing" });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary Error Log:", errorData);
      throw new Error(`Cloudinary Error: ${errorData.error?.message} (Status: ${response.status})`);
    }

    const data = await response.json();
    console.log("Upload Success:", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
