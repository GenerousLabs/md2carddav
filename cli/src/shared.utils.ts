/* eslint-disable prefer-spread */
import { Command } from "@oclif/core";
import { CommandContext } from "./shared.types";
import { cosmiconfig } from "cosmiconfig";
import { z } from "zod";

export const ConfigSchema = z
  .object({
    url: z.string().url(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .strict();

const transformConfigToNullIfInvalid = (
  config: Awaited<ReturnType<Awaited<ReturnType<typeof cosmiconfig>>["search"]>>
): Awaited<ReturnType<Awaited<ReturnType<typeof cosmiconfig>>["search"]>> => {
  if (config === null) {
    return config;
  }

  const result = ConfigSchema.safeParse(config.config);
  if (!result.success) {
    return {
      config: "invalid",
      filepath: config.filepath,
      isEmpty: false,
    };
  }

  return config;
};

const getConfig = async (error: CommandContext["error"]) => {
  const explorer = cosmiconfig("md2carddav", {
    transform: transformConfigToNullIfInvalid,
  });
  const config = await explorer.search();

  if (
    typeof config === "undefined" ||
    config === null ||
    config.isEmpty === true
  ) {
    return error("Failed to find config. #1GBTBQ");
  }

  if (config.config === "invalid") {
    return error(`Config is invalid. #P46JQn Path: ${config.filepath}`);
  }

  return config.config;
};

export const getContext = async (
  _this: InstanceType<{ new (): Command } & Command>
): Promise<CommandContext> => {
  const config = await getConfig(_this.error);

  return {
    log: (...args) => _this.log.apply(_this, args as any),
    error: (...args) => _this.error.apply(_this, args as any),
    // We need to assign because debug is protected
    debug: (_this as any).debug,
    config,
  };
};
