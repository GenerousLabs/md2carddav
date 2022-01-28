import { Command } from "@oclif/core";
import { z } from "zod";
import { Contact } from "./services/md/services/contacts/contacts.service";
import { ConfigSchema } from "./shared.config";

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

export type CommandContext = Pick<Command, "log" | "error"> & {
  debug(...args: any[]): void;
  config: z.infer<typeof ConfigSchema>;
};

export type ContactFields = keyof Contact;
