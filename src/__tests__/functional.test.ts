import "expect-puppeteer";
import { ElementHandle, CoverageEntry } from "puppeteer";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pti = require("puppeteer-to-istanbul");
const totalJsCoverage: CoverageEntry[] = [];

describe.each(["flat", "nested"])("interaction tests %s", (type) => {
  beforeAll(async () => {
    await page.coverage.startJSCoverage();
    await page.goto(`http://localhost:3000/?type=${type}`);
  });

  test("resize images on create", async () => {
    const fourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    expect(await fourthImg.evaluate((node) => node.style.width)).toBe("25%");
    const fifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#five");
    expect(await fifthImg.evaluate((node) => node.style.width)).toBe(
      "10.3093%"
    );
  });

  test(`click to open dataset lightbox`, async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");

    const img: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    const imgSrc = await img.evaluate((node) => node.src);
    const imgHigh = (await img.evaluate(
      (node) => node.dataset.highres
    )) as string;

    await expect(page).toClick("#four");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await img.evaluate((node) => node.classList))
    ).toContain("active");
    expect(await img.evaluate((node) => node.style.transform)).toBe(
      "translate(-300%, 0%) scale(4)"
    );
    expect(await img.evaluate((node) => node.src)).toBe(imgHigh);
    expect(await img.evaluate((node) => node.dataset.lowres)).toBe(imgSrc);
  });

  test(`click to close dataset lightbox`, async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const img: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    const imgLow = await img.evaluate((node) => node.dataset.lowres);

    await expect(page).toClick("#four");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");
    expect(
      Object.values(await img.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(await img.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await img.evaluate((node) => node.src)).toBe(imgLow);
  });

  test(`click to advance dataset lightbox`, async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");

    const img: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#six");
    const imgSrc = await img.evaluate((node) => node.src);
    const imgHigh = (await img.evaluate(
      (node) => node.dataset.highres
    )) as string;

    await expect(page).toClick("#five");
    await expect(page).toClick("#six");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await img.evaluate((node) => node.classList))
    ).toContain("active");
    expect(await img.evaluate((node) => node.style.transform)).toBe(
      "translate(-44.4444%, -109.167%) scale(4.35556)"
    );
    expect(await img.evaluate((node) => node.src)).toBe(imgHigh);
    expect(await img.evaluate((node) => node.dataset.lowres)).toBe(imgSrc);

    await expect(page).toClick("#six"); // close lightbox
  });

  test(`click to open srcset lightbox`, async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");

    const img: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#ten");

    await expect(page).toClick("#ten");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await img.evaluate((node) => node.classList))
    ).toContain("active");
    expect(await img.evaluate((node) => node.style.transform)).toBe(
      "translate(-638.613%, -110.084%) scale(4.97479)"
    );
    expect(await img.evaluate((node) => node.sizes)).toBe("100vw");
    expect(await img.evaluate((node) => node.dataset.sizes)).toBe(
      "(max-width: 800px) 10vw, 853px"
    );
  });

  test(`click to close srcset lightbox`, async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const img: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#ten");

    await expect(page).toClick("#ten");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");
    expect(
      Object.values(await img.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(await img.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await img.evaluate((node) => node.sizes)).toBe(
      "(max-width: 800px) 10vw, 853px"
    );
  });

  test("right arrow to advance to next image", async () => {
    const gallery = await expect(page).toMatchElement("#gallery");

    // open lightbox
    await expect(page).toClick("#four");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const fourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    const fifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#five");
    const fifthImgSrc = await fifthImg.evaluate((node) => node.src);
    const fifthImgHigh = await fifthImg.evaluate(
      (node) => node.dataset.highres
    );

    await page.keyboard.press("ArrowRight");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await fourthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await fifthImg.evaluate((node) => node.classList))
    ).toContain("active");

    const fifthTransform = await fifthImg.evaluate(
      (node) => node.style.transform
    );
    const fifthTransformSplit = fifthTransform.split(" ");
    expect(fifthTransformSplit[0]).toBe("translate(243.333%,");
    // flat: -109.167, nested: -108.264 (close enough?)
    expect(parseFloat(fifthTransformSplit[1].slice(0, -2))).toBeCloseTo(
      -109.167,
      -1
    );
    expect(fifthTransformSplit[2]).toBe("scale(4.93333)");
    expect(await fifthImg.evaluate((node) => node.src)).toBe(fifthImgHigh);
    expect(await fifthImg.evaluate((node) => node.dataset.lowres)).toBe(
      fifthImgSrc
    );
  });

  test("left arrow to go to previous image", async () => {
    const gallery = await expect(page).toMatchElement("#gallery");

    const fourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    const fifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#five");
    const fourthImgSrc = await fourthImg.evaluate((node) => node.src);
    const fourthImgHigh = await fourthImg.evaluate(
      (node) => node.dataset.highres
    );

    await page.keyboard.press("ArrowLeft");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await fourthImg.evaluate((node) => node.classList))
    ).toContain("active");
    expect(
      Object.values(await fifthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(await fourthImg.evaluate((node) => node.style.transform)).toBe(
      "translate(-300%, 0%) scale(4)"
    );
    expect(await fourthImg.evaluate((node) => node.src)).toBe(fourthImgHigh);
    expect(await fourthImg.evaluate((node) => node.dataset.lowres)).toBe(
      fourthImgSrc
    );
  });

  test("escape closes lightbox", async () => {
    const gallery = await expect(page).toMatchElement("#gallery");
    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const fourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#four");
    const fifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#five");

    await page.keyboard.press("Escape");

    expect(
      Object.values(await gallery.evaluate((node) => node.classList))
    ).not.toContain("lightbox");
    expect(
      Object.values(await fourthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await fifthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(await fifthImg.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await fourthImg.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await fourthImg.evaluate((node) => node.src)).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAACnAQMAAAACMtNXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAADUExURX9/f5DKGyMAAAAcSURBVBgZ7cExAQAAAMIg+6deCj9gAAAAAAA8BRWHAAFREbyXAAAAAElFTkSuQmCC"
    );
    expect(await fifthImg.evaluate((node) => node.src)).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKcAAAD6AQMAAAD+yMWGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAADUExURaGhoWkNFFsAAAAcSURBVBgZ7cExAQAAAMIg+6deCU9gAAAAAADcBRV8AAE4UWJ7AAAAAElFTkSuQmCC"
    );
  });

  afterAll(async () => {
    const jsCoverage = await page.coverage.stopJSCoverage();
    totalJsCoverage.push(...jsCoverage.slice(1));
  });
});

describe("multiple galleries with keyboards", () => {
  beforeAll(async () => {
    await page.coverage.startJSCoverage();
    await page.goto(`http://localhost:3000/?type=multi`);
  });

  test("right arrow to advance to next image in second gallery", async () => {
    const flat = await expect(page).toMatchElement("#flat");
    const nested = await expect(page).toMatchElement("#nested");

    // open second lightbox
    await expect(page).toClick("#nested-four");
    expect(
      Object.values(await nested.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const fourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#nested-four");
    const fifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#nested-five");
    const fifthImgSrc = await fifthImg.evaluate((node) => node.src);
    const fifthImgHigh = await fifthImg.evaluate(
      (node) => node.dataset.highres
    );

    await page.keyboard.press("ArrowRight");

    expect(
      Object.values(await flat.evaluate((node) => node.classList))
    ).not.toContain("lightbox");
    expect(
      Object.values(await nested.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await fourthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await fifthImg.evaluate((node) => node.classList))
    ).toContain("active");

    const fifthTransform = await fifthImg.evaluate(
      (node) => node.style.transform
    );
    const fifthTransformSplit = fifthTransform.split(" ");
    expect(fifthTransformSplit[0]).toBe("translate(337.819%,");
    // flat: -109.167, nested: -108.264 (close enough?)
    expect(parseFloat(fifthTransformSplit[1].slice(0, -2))).toBeCloseTo(
      -109.167,
      -1
    );
    expect(fifthTransformSplit[2]).toBe("scale(3.04362)");
    expect(await fifthImg.evaluate((node) => node.src)).toBe(fifthImgHigh);
    expect(await fifthImg.evaluate((node) => node.dataset.lowres)).toBe(
      fifthImgSrc
    );
  });

  test("escape closes first lightbox", async () => {
    const flat = await expect(page).toMatchElement("#flat");
    // open first lightbox
    await expect(page).toClick("#flat-four");
    expect(
      Object.values(await flat.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const nested = await expect(page).toMatchElement("#nested");
    expect(
      Object.values(await nested.evaluate((node) => node.classList))
    ).toContain("lightbox");

    const firstFourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#flat-four");
    const firstFifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#flat-five");

    const secondFourthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#nested-four");
    const secondFifthImg: ElementHandle<HTMLImageElement> = await expect(
      page
    ).toMatchElement("#nested-five");

    await page.keyboard.press("Escape");

    expect(
      Object.values(await flat.evaluate((node) => node.classList))
    ).not.toContain("lightbox");
    expect(
      Object.values(await nested.evaluate((node) => node.classList))
    ).toContain("lightbox");
    expect(
      Object.values(await firstFourthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await firstFifthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await secondFourthImg.evaluate((node) => node.classList))
    ).not.toContain("active");
    expect(
      Object.values(await secondFifthImg.evaluate((node) => node.classList))
    ).toContain("active");
    expect(await firstFifthImg.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await firstFourthImg.evaluate((node) => node.style.transform)).toBe(
      "translate(0px, 0px) scale(1)"
    );
    expect(await firstFourthImg.evaluate((node) => node.src)).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAACnAQMAAAACMtNXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAADUExURX9/f5DKGyMAAAAcSURBVBgZ7cExAQAAAMIg+6deCj9gAAAAAAA8BRWHAAFREbyXAAAAAElFTkSuQmCC"
    );
    expect(await firstFifthImg.evaluate((node) => node.src)).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKcAAAD6AQMAAAD+yMWGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAADUExURaGhoWkNFFsAAAAcSURBVBgZ7cExAQAAAMIg+6deCU9gAAAAAADcBRV8AAE4UWJ7AAAAAElFTkSuQmCC"
    );
  });

  afterAll(async () => {
    const jsCoverage = await page.coverage.stopJSCoverage();
    totalJsCoverage.push(...jsCoverage.slice(1));
  });
});

afterAll(async () => {
  // skips the javascript in the html file
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await pti.write(totalJsCoverage, {
    includeHostname: false,
  });
});
