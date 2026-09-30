import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "theme.css"), "utf-8");

const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} 블록이 있어야 한다`).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--motile-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ])
  );
};

describe("theme.css", () => {
  const light = block(":where(:root)");
  const dark = block(':where(:root[data-theme="dark"])');
  const osDark = block(':where(:root:not([data-theme="light"]))');

  it("라이트·다크·OS 다크가 같은 변수를 모두 정의한다", () => {
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
    expect(Object.keys(osDark).sort()).toEqual(Object.keys(light).sort());
  });

  it("OS 다크는 data-theme 다크와 같은 값이다", () => {
    expect(osDark).toEqual(dark);
  });

  it("OS 다크는 prefers-color-scheme 미디어 안에만 있다", () => {
    const media = css.indexOf("@media (prefers-color-scheme: dark)");
    const osDarkAt = css.indexOf(':where(:root:not([data-theme="light"]))');
    expect(media).toBeGreaterThanOrEqual(0);
    expect(osDarkAt).toBeGreaterThan(media);
  });
});
