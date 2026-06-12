import { randomBytes } from "node:crypto";

/** 32 bytes hex-encoded (64 chars). Never log the return value. */
export function generateManageToken(): string {
  return randomBytes(32).toString("hex");
}
