import { describe, expect, it, vi } from "vitest";

import { useEscapeKey } from "@/hooks/useEscapeKey";
import { render } from "@/test/utils";

import { Popover } from "./Popover";

/**
 * Popover × ESC 스택 회귀 테스트.
 *
 * 계약: ESC로 닫히지 않을 상태(autoClose=false)의 Popover는 ESC 스택의
 * top 슬롯을 점유하면 안 된다 — 점유하면 아래 오버레이(예: Sheet)의 ESC를
 * 삼켜버린다. 닫힘 조건은 handler 내부가 아니라 `enabled`에 접어야 한다
 * (Modal/SpeedDial과 동일한 honest-enabled 패턴).
 */

function UnderlayEsc({ handler }: { handler: (e: KeyboardEvent) => void }) {
  // 아래에 깔린 오버레이(Sheet 등)의 stacked ESC를 시뮬레이션
  useEscapeKey({ handler, enabled: true, stacked: true });
  return null;
}

function pressEscape() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
  );
}

describe("Popover ESC 스택 (honest enabled)", () => {
  it("autoClose=false인 열린 Popover는 아래 stacked 오버레이의 ESC를 삼키지 않는다", () => {
    const underlay = vi.fn();

    render(
      <>
        <UnderlayEsc handler={underlay} />
        <Popover.Root open={true} autoClose={false}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      </>
    );

    pressEscape();

    // Popover가 ESC로 닫히지 않는 상태라면 top을 점유하지 않아야 하고,
    // 아래 오버레이가 ESC를 받아야 한다.
    expect(underlay).toHaveBeenCalledTimes(1);
  });

  it("autoClose=true(기본)인 열린 Popover는 top으로서 ESC를 받고 아래는 대기한다", () => {
    const underlay = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <>
        <UnderlayEsc handler={underlay} />
        <Popover.Root open={true} onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      </>
    );

    pressEscape();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(underlay).toHaveBeenCalledTimes(0);
  });
});
