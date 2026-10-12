import { appIkon } from "@/lib/app-ikon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return appIkon(size.width);
}
