import { expect, test } from "@oclif/test";

describe("carddav:wipe", () => {
  test
    .stdout()
    .command(["carddav:wipe"])
    .it("runs hello", (ctx) => {
      expect(ctx.stdout).to.contain("hello world");
    });

  test
    .stdout()
    .command(["carddav:wipe", "--name", "jeff"])
    .it("runs hello --name jeff", (ctx) => {
      expect(ctx.stdout).to.contain("hello jeff");
    });
});
