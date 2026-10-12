import { appIkon } from "@/lib/app-ikon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return appIkon(size.width);
}
