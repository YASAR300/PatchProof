import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#5B6CFF",
          borderRadius: 7,
          color: "#ffffff",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path d="M7 7C7 7 15 5 16 5V27C13.5 25.5 7 20.5 7 14V7Z" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M25 7C25 7 17 5 16 5V27C18.5 25.5 25 20.5 25 14V7Z" fill="#FFFFFF" />
          <path d="M12 15L15 18L21 11" stroke="#5B6CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
