import { z } from "zod";
import { ConfigSchema } from "./config.ts";
import { ContactSchema } from "./schemas.ts";

export type ErrorResult = {
  success: false;
  error: string;
  code: string;
};

export type SuccessResult<Returns> = {
  success: true;
  result: Returns;
};

export type Returns<RT> = ErrorResult | SuccessResult<RT>;

export type CommandContext = {
  log(...args: unknown[]): void;
  warn(message: string): void;
  error(message: string): never;
  debug(...args: unknown[]): void;
  config: z.infer<typeof ConfigSchema>;
};

export type Contact = z.infer<typeof ContactSchema>;
export type ContactField = keyof Contact;
