/* eslint-disable prefer-spread */
import { Command } from "@oclif/core";
import { CommandContext } from "./shared.types";

export const getContext = async (
  _this: InstanceType<{ new (): Command } & Command>
): Promise<CommandContext> => {
  return {
    log: (...args) => _this.log.apply(_this, args as any),
    error: (...args) => _this.error.apply(_this, args as any),
    // We need to assign because debug is protected
    debug: (_this as any).debug,
  };
};
