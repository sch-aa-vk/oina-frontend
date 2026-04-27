export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82,
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Canvas can't preserve GIF animation, skip compression
    if (file.type === "image/gif") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () =>
        reject(new Error(`Could not process ${file.name}.`));
      image.onload = () => {
        const scale = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height,
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error(`Could not process ${file.name}.`));
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error(`Could not compress ${file.name}.`));
              return;
            }
            const name = file.name.replace(/\.[^.]+$/, ".jpg");
            resolve(new File([blob], name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
