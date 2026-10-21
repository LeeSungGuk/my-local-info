import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function getVersionedBlogCoverUrl(
  coverImage: string,
  publicDirectory = path.join(process.cwd(), "public"),
): string {
  const match = /^\/blog-covers\/([A-Za-z0-9_-]+\.svg)(?:\?([^#]*))?(#.*)?$/.exec(coverImage);

  if (!match) {
    return coverImage;
  }

  const coversDirectory = path.join(publicDirectory, "blog-covers");
  const filePath = path.join(coversDirectory, match[1]);

  try {
    if (!fs.lstatSync(coversDirectory).isDirectory() || !fs.lstatSync(filePath).isFile()) {
      return coverImage;
    }

    const version = createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 12);
    const query = new URLSearchParams(match[2]);
    query.set("v", version);

    return `/blog-covers/${match[1]}?${query.toString()}${match[3] || ""}`;
  } catch {
    return coverImage;
  }
}
