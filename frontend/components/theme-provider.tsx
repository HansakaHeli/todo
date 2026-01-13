"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider(props: React.PropsWithChildren<ThemeProviderProps>) {
  const { children, ...rest } = props;
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>;
}


