import { useState } from "react";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { type FakeHistory, installFakeHistory } from "@/test/fakeHistory";
import { act, render, screen, waitFor } from "@/test/utils";

import { Sheet } from "./Sheet";

/**
 * 중첩 Sheet 통합 테스트 (컴포넌트 레벨).
 *
 * "Sheet 위 Sheet"(베이스 + 편집) 시나리오에서 히스토리/닫기 동작이
 * 한 겹씩 정확히 벗겨지는지 검증한다. 기존 Sheet.test.tsx(단일 시트 계약)는
 * 수정하지 않는다 — 이 파일은 중첩 전용.
 */

interface NestedApi {
  setBaseOpen: (open: boolean) => void;
  setEditorOpen: (open: boolean) => void;
}

interface TwoSheetsProps {
  api: React.MutableRefObject<NestedApi | null>;
  baseEnableHistory?: boolean;
}

function TwoSheets({ api, baseEnableHistory = true }: TwoSheetsProps) {
  const [baseOpen, setBaseOpen] = useState(true);
  const [editorOpen, setEditorOpen] = useState(true);
  api.current = { setBaseOpen, setEditorOpen };

  return (
    <>
      <Sheet.Root
        open={baseOpen}
        onOpenChange={setBaseOpen}
        enableHistoryClose={baseEnableHistory}
      >
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Body>base-content</Sheet.Body>
            <Sheet.Close>base-close</Sheet.Close>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>

      <Sheet.Root open={editorOpen} onOpenChange={setEditorOpen} zIndex={1100}>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Body>editor-content</Sheet.Body>
            <Sheet.Close>editor-close</Sheet.Close>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    </>
  );
}

function createApiRef() {
  return { current: null } as React.MutableRefObject<NestedApi | null>;
}

describe("Sheet 중첩 (nested)", () => {
  let fake: FakeHistory;

  beforeEach(() => {
    fake = installFakeHistory();
  });

  afterEach(() => {
    fake.restore();
  });

  it("N1: 뒤로가기 1회는 top(편집) 시트만 닫는다", async () => {
    const api = createApiRef();
    render(<TwoSheets api={api} />);

    expect(screen.getByText("base-content")).toBeInTheDocument();
    expect(screen.getByText("editor-content")).toBeInTheDocument();

    act(() => {
      fake.userBack();
    });

    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });
    expect(screen.getByText("base-content")).toBeInTheDocument();
  });

  it("N2: 편집 시트의 Close 버튼은 base를 남긴다", async () => {
    const api = createApiRef();
    const { getByText } = render(<TwoSheets api={api} />);

    act(() => {
      getByText("editor-close").click();
    });

    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });
    expect(screen.getByText("base-content")).toBeInTheDocument();
    expect(fake.backSpy).toHaveBeenCalledTimes(1); // 편집 더미 정리 1회뿐
  });

  it("N3: 두 번째 뒤로가기가 base를 닫는다", async () => {
    const api = createApiRef();
    render(<TwoSheets api={api} />);

    act(() => {
      fake.userBack();
    });
    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });

    act(() => {
      fake.userBack();
    });
    await waitFor(() => {
      expect(screen.queryByText("base-content")).not.toBeInTheDocument();
    });
    expect(fake.state()).toBeNull(); // 원래 페이지
  });

  it("N4: base가 먼저 프로그램적으로 닫힌 뒤 편집 Close → 히스토리가 페이지까지 정리된다", async () => {
    const api = createApiRef();
    const { getByText } = render(<TwoSheets api={api} />);

    act(() => {
      api.current!.setBaseOpen(false);
    });
    await waitFor(() => {
      expect(screen.queryByText("base-content")).not.toBeInTheDocument();
    });

    act(() => {
      getByText("editor-close").click();
    });
    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });

    // 편집 close-back + 고아(base 더미) 스킵 back → 원래 페이지
    expect(fake.state()).toBeNull();
    expect(fake.backSpy).toHaveBeenCalledTimes(2);
  });

  it("N5: 히스토리 닫기 시 편집 시트는 애니메이션 대기 없이 즉시 언마운트된다", async () => {
    const api = createApiRef();
    render(<TwoSheets api={api} />);

    act(() => {
      fake.userBack();
    });

    // isClosingFromHistory → closingDuration 0 (300ms를 기다리면 timeout 120ms에 실패)
    await waitFor(
      () => {
        expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
      },
      { timeout: 120 }
    );
    expect(screen.getByText("base-content")).toBeInTheDocument();
  });

  it("N6: base enableHistoryClose=false 혼합 — 뒤로가기는 편집만, base는 직접 닫힌다", async () => {
    const api = createApiRef();
    const { getByText } = render(
      <TwoSheets api={api} baseEnableHistory={false} />
    );

    expect(fake.pushStateSpy).toHaveBeenCalledTimes(1); // 편집 더미만

    act(() => {
      fake.userBack();
    });
    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });
    expect(screen.getByText("base-content")).toBeInTheDocument();

    act(() => {
      getByText("base-close").click();
    });
    await waitFor(() => {
      expect(screen.queryByText("base-content")).not.toBeInTheDocument();
    });
    expect(fake.backSpy).toHaveBeenCalledTimes(0); // 히스토리 미참여 → back 없음
  });

  it("N7: ESC 1회는 편집만, 2회째에 base가 닫힌다", async () => {
    const api = createApiRef();
    render(<TwoSheets api={api} />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("editor-content")).not.toBeInTheDocument();
    });
    expect(screen.getByText("base-content")).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("base-content")).not.toBeInTheDocument();
    });
    expect(fake.state()).toBeNull(); // 히스토리도 페이지까지 정리
  });
});
