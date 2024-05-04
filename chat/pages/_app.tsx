import * as React from "react";
import type { AppProps } from "next/app";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrimeReactProvider>
        <Component {...pageProps} />
    </PrimeReactProvider>
  );
}
