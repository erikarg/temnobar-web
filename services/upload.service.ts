import { api } from "./api";

type UploadResult = {
  url: string;
  thumb_url: string;
};

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
