import { describe, expect, it, vi } from "vitest";

import { useEscapeKey } from "@/hooks/useEscapeKey";
import { render } from "@/test/utils";

import { Select } from "./Select";

/**
 * Select × ESC 스택 회귀 테스트.
 *
 * 계약: ESC로 닫히지 않을 상태(enableEscapeKey=false, 즉 closeOnBackdrop=false)의
 * 열린 Select는 ESC 스택 top을 점유하면 안 된다 — 점유하면 아래 오버레이의
 * ESC를 삼킨다. 닫힘 조건은 `enabled`에 접어야 한다(honest-enabled).
 * (테스트 환경 matchMedia는 matches:false → 데스크톱 경로)
 */

function UnderlayEsc({ handler }: { handler: (e: KeyboardEvent) => void }) {
  useEscapeKey({ handler, enabled: true, stacked: true });
  return null;
}

function pressEscape() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
  );
}

function renderOpenSelect(
  underlay: (e: KeyboardEvent) => void,
  props: { closeOnBackdrop?: boolean; onOpenChange?: (open: boolean) => void }
) {
  return render(
    <>
      <UnderlayEsc handler={underlay} />
      <Select.Root open={true} {...props}>
        <Select.Trigger>
          <Select.Value placeholder="선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
        </Select.Content>
      </Select.Root>
    </>
  );
}

describe("Select ESC 스택 (honest enabled)", () => {
  it("closeOnBackdrop=false인 열린 Select는 아래 stacked 오버레이의 ESC를 삼키지 않는다", () => {
    const underlay = vi.fn();

    renderOpenSelect(underlay, { closeOnBackdrop: false });

    pressEscape();

    expect(underlay).toHaveBeenCalledTimes(1);
  });

  it("기본 설정의 열린 Select는 top으로서 ESC를 받고 아래는 대기한다", () => {
    const underlay = vi.fn();
    const onOpenChange = vi.fn();

    renderOpenSelect(underlay, { onOpenChange });

    pressEscape();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(underlay).toHaveBeenCalledTimes(0);
  });
});
