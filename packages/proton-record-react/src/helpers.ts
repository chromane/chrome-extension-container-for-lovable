export function get_id() {
  return Date.now().toString(36) + Math.floor(Math.random() * 1_000_000_000_000).toString(36);
}

export function blob_to_base64(blob: Blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function base64_to_blob(base64: string) {
  const response = await fetch(base64);
  return await response.blob();
}
