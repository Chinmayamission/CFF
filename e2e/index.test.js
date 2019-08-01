const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

describe("Google", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:8000");
    // await page.setViewport({ width: 1280, height: 720 });
  });

  it("initial login page", async () => {
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});
