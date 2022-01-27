import { expect, test } from "@oclif/test";

describe("sync", () => {
  test
    .stdout()
    .command(["sync"])
    .it("runs hello", (ctx) => {
      expect(ctx.stdout).to.contain("Works");
    });

  test
    .stdout()
    .command(["sync", "--directory", "/tmp"])
    .it("runs hello --directory /tmp", (ctx) => {
      expect(ctx.stdout).to.contain("Works");
    });
});
