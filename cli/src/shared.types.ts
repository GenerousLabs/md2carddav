import { Command } from "@oclif/core";
import { z } from "zod";
import { ConfigSchema } from "./shared.config";
import { ContactSchema } from "./shared.schemas";

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

export type CommandContext = Pick<Command, "log" | "warn" | "error"> & {
  debug(...args: any[]): void;
  config: z.infer<typeof ConfigSchema>;
};

export type Contact = z.infer<typeof ContactSchema>;
export type ContactField = keyof Contact;
