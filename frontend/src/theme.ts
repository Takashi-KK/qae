"use client";
import { Roboto, Kosugi_Maru } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
const kosugi = Kosugi_Maru({
  weight: ["400"],
  subsets: ["latin"],
});

const theme = createTheme({
  typography: {
    fontFamily: [roboto.style.fontFamily, kosugi.style.fontFamily].join(","),
    fontSize: 14,
    button: {
      textTransform: "none",
    },
    body2: { fontSize: 12 },
  },
  palette: {
    primary: {
      main: "#0072bc",
      light: "#19a3fc",
      dark: "#005b96",
    },
    mode: "light",
  },
});

export default theme;
