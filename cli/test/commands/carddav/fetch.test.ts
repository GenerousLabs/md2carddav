import { expect, test } from "@oclif/test";

describe("carddav:fetch", () => {
  test
    .stdout()
    .command(["carddav:fetch"])
    .it("runs hello", (ctx) => {
      expect(ctx.stdout).to.contain("hello world");
    });

  test
    .stdout()
    .command(["carddav:fetch", "--name", "jeff"])
    .it("runs hello --name jeff", (ctx) => {
      expect(ctx.stdout).to.contain("hello jeff");
    });
});
