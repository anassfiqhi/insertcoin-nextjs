"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="grid place-items-center gap-6 py-24 text-center"
    >
      <p className="font-pixel text-xs text-destructive">SYSTEM ERROR</p>
      <p className="max-w-md text-muted-foreground">
        {error.message || "Something went wrong."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
