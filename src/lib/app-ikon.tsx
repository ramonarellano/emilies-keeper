import { ImageResponse } from "next/og";

// Tegner app-ikonet. Brukes av både icon.tsx og apple-icon.tsx.
export function appIkon(storrelse: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e8879f 0%, #b45c8a 100%)",
          color: "#fff8f2",
          fontSize: storrelse * 0.58,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        E
      </div>
    ),
    { width: storrelse, height: storrelse },
  );
}
