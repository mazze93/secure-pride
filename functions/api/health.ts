import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction = async () => {
  return Response.json({ status: "ok", service: "secure-pride-dlp" });
};
