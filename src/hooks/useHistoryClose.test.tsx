import { StrictMode } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type FakeHistory, installFakeHistory } from "@/test/fakeHistory";
import { act, render, waitFor } from "@/test/utils";

import type { UseHistoryCloseReturn } from "./useHistoryClose";
import { useHistoryClose } from "./useHistoryClose";

/**
 * useHistoryClose 훅 단위 테스트.
 *
 * [특성화(H1~H7)] 기존 v1.3.1 동작을 훅 레벨에서 고정한다 — 이 블록은 구현 변경
 * 전후 모두 그린이어야 하며, FakeHistory 헬퍼의 정합성 검증을 겸한다.
 * (컴포넌트 레벨 계약은 Sheet.test.tsx의 기존 테스트가 별도로 고정)
 */

interface HostApi extends UseHistoryCloseReturn {}

interface HostProps {
  open: boolean;
  onClose: () => void;
  enabled?: boolean;
  api: React.MutableRefObject<HostApi | null>;
}

function Host({ open, onClose, enabled = true, api }: HostProps) {
  const ret = useHistoryClose({ isOpen: open, onClose, enabled });
  api.current = ret;
  return null;
}

function createApiRef() {
  return { current: null } as React.MutableRefObject<HostApi | null>;
}

/** 열린 Host 하나를 마운트하고 (rerender, api, onClose) 반환 */
function mountOpenHost(enabled = true) {
  const api = createApiRef();
  const onClose = vi.fn();
  const view = render(
    <Host open={true} onClose={onClose} enabled={enabled} api={api} />
  );
  const setOpen = (open: boolean) =>
    view.rerender(
      <Host open={open} onClose={onClose} enabled={enabled} api={api} />
    );
  return { api, onClose, setOpen, view };
}

describe("useHistoryClose", () => {
  let fake: FakeHistory;

  beforeEach(() => {
    fake = installFakeHistory();
  });

  afterEach(() => {
    fake.restore();
  });

  describe("특성화 — 단일 인스턴스 (v1.3.1 계약 고정)", () => {
    it("H1: 열릴 때 더미 히스토리를 정확히 1개 push한다", () => {
      mountOpenHost();

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(1);
      const pushed = fake.pushStateSpy.mock.calls[0][0] as {
        __motileSheetModal?: unknown;
      };
      expect(typeof pushed.__motileSheetModal).toBe("string");
      expect(fake.index()).toBe(1);
      expect(fake.state()).toEqual(pushed);
    });

    it("H2: 제어형 닫힘(prop) 시 자기 더미 위에서 back()으로 정리한다", async () => {
      const { setOpen } = mountOpenHost();

      setOpen(false);

      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(1);
      });
      expect(fake.index()).toBe(0);
      expect(fake.state()).toBeNull();
    });

    it("H3: 사용자 뒤로가기(popstate)로 닫힐 때 back()을 추가 호출하지 않는다", async () => {
      const { onClose, setOpen } = mountOpenHost();

      act(() => {
        fake.userBack();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
      // 실사용처럼 부모가 open=false로 반영
      setOpen(false);

      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(0);
      });
      expect(fake.index()).toBe(0);
    });

    it("H4: close() 호출 시 자기 더미 위면 back() 경유로 닫힌다(onClose는 popstate에서)", async () => {
      const { api, onClose, setOpen } = mountOpenHost();

      act(() => {
        api.current!.close();
      });

      expect(fake.backSpy).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      setOpen(false);

      await waitFor(() => {
        // 정리 effect가 추가 back()을 만들지 않는다
        expect(fake.backSpy).toHaveBeenCalledTimes(1);
      });
      expect(fake.index()).toBe(0);
    });

    it("H5: 외부 pushState가 위에 쌓인 뒤 close()하면 직접 닫고 back()하지 않는다(고스트 잔존)", async () => {
      const { api, onClose, setOpen } = mountOpenHost();

      act(() => {
        // 외부 코드(analytics 등)의 pushState
        window.history.pushState({ external: true }, "");
      });

      act(() => {
        api.current!.close();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(fake.backSpy).toHaveBeenCalledTimes(0);
      setOpen(false);

      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(0);
      });
      // [page, dummy, external] 3개 그대로 — 더미는 고스트로 남는다(기존 시맨틱)
      expect(fake.length()).toBe(3);
    });

    it("H6: navigateAndClose는 더미 정리(back) 후 네비게이션 콜백을 실행한다", async () => {
      const { api, onClose, setOpen } = mountOpenHost();
      const navigate = vi.fn();

      act(() => {
        api.current!.navigateAndClose(navigate);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(navigate).not.toHaveBeenCalled();
      setOpen(false);

      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(navigate).toHaveBeenCalledTimes(1);
      });
      expect(fake.index()).toBe(0);
    });

    it("H7: enabled=false면 히스토리를 전혀 건드리지 않고 close()는 직접 닫는다", async () => {
      const { api, onClose, setOpen } = mountOpenHost(false);

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(0);

      act(() => {
        api.current!.close();
      });
      expect(onClose).toHaveBeenCalledTimes(1);

      act(() => {
        fake.userBack(); // 리스너가 없어야 하므로 아무 일도 없어야 함
      });
      expect(onClose).toHaveBeenCalledTimes(1);

      setOpen(false);
      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(0);
      });
      expect(fake.pushStateSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("중첩 — nesting-safe 레지스트리", () => {
    interface PairProps {
      baseOpen: boolean;
      editorOpen: boolean;
      baseOnClose: () => void;
      editorOnClose: () => void;
      baseApi: React.MutableRefObject<HostApi | null>;
      editorApi: React.MutableRefObject<HostApi | null>;
      baseEnabled?: boolean;
      /** editor를 조건부 마운트(언마운트 시나리오용). 기본은 항상 마운트 */
      mountEditor?: boolean;
      mountBase?: boolean;
    }

    function Pair({
      baseOpen,
      editorOpen,
      baseOnClose,
      editorOnClose,
      baseApi,
      editorApi,
      baseEnabled = true,
      mountEditor = true,
      mountBase = true,
    }: PairProps) {
      return (
        <>
          {mountBase ? (
            <Host
              open={baseOpen}
              onClose={baseOnClose}
              enabled={baseEnabled}
              api={baseApi}
            />
          ) : null}
          {mountEditor ? (
            <Host open={editorOpen} onClose={editorOnClose} api={editorApi} />
          ) : null}
        </>
      );
    }

    /** base → editor 순서로 열린 2중첩 셋업 */
    function mountPair(fake: FakeHistory, baseEnabled = true) {
      const baseApi = createApiRef();
      const editorApi = createApiRef();
      const baseOnClose = vi.fn();
      const editorOnClose = vi.fn();
      const props = {
        baseOnClose,
        editorOnClose,
        baseApi,
        editorApi,
        baseEnabled,
      };
      const view = render(
        <Pair {...props} baseOpen={true} editorOpen={true} />
      );
      const update = (
        next: Partial<
          Pick<
            PairProps,
            "baseOpen" | "editorOpen" | "mountEditor" | "mountBase"
          >
        > & { baseOpen: boolean; editorOpen: boolean }
      ) => view.rerender(<Pair {...props} {...next} />);
      const dummyOf = (callIndex: number) =>
        fake.pushStateSpy.mock.calls[callIndex][0];
      return {
        baseApi,
        editorApi,
        baseOnClose,
        editorOnClose,
        update,
        dummyOf,
        view,
      };
    }

    it("H8: 뒤로가기 1회는 top(편집)만 닫고, 2회째에 base가 닫힌다", async () => {
      const p = mountPair(fake);
      expect(fake.pushStateSpy).toHaveBeenCalledTimes(2);

      act(() => {
        fake.userBack();
      });
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      expect(fake.state()).toEqual(p.dummyOf(0)); // base 더미 위

      p.update({ baseOpen: true, editorOpen: false });

      act(() => {
        fake.userBack();
      });
      expect(p.baseOnClose).toHaveBeenCalledTimes(1);
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(fake.state()).toBeNull(); // 원래 페이지

      p.update({ baseOpen: false, editorOpen: false });
      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(0); // 전부 사용자 pop
      });
    });

    it("H9: 편집 close()는 base를 건드리지 않는다", async () => {
      const p = mountPair(fake);

      act(() => {
        p.editorApi.current!.close();
      });

      expect(fake.backSpy).toHaveBeenCalledTimes(1);
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      expect(fake.state()).toEqual(p.dummyOf(0)); // base 더미 유지

      p.update({ baseOpen: true, editorOpen: false });
      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(1); // 추가 back 없음
      });
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
    });

    it("H10: base가 먼저 프로그램적으로 닫힌 뒤 편집 close() → 고아 더미까지 한 번에 소비", async () => {
      const p = mountPair(fake);

      // base만 prop으로 닫힘 (편집은 열린 채)
      p.update({ baseOpen: false, editorOpen: true });

      await waitFor(() => {
        // base 더미는 아직 소비 불가(위에 editor 더미) → back 없음
        expect(fake.backSpy).toHaveBeenCalledTimes(0);
      });

      act(() => {
        p.editorApi.current!.close();
      });

      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      // 편집 close-back 1회 + 고아(base 더미) 스킵 back 1회
      expect(fake.backSpy).toHaveBeenCalledTimes(2);
      expect(fake.state()).toBeNull(); // 원래 페이지까지 정리
    });

    it("H12: 편집이 prop으로 닫힐 때의 정리 back()이 base를 닫으면 안 된다 (소비 pop 억제)", async () => {
      const p = mountPair(fake);

      // 편집만 prop 닫힘 (close() 아님) — 정리용 back()이 발생하는 경로
      p.update({ baseOpen: true, editorOpen: false });

      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(1);
      });
      // 핵심: 그 back()의 popstate가 base를 닫지 않아야 한다
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      expect(p.editorOnClose).toHaveBeenCalledTimes(0); // prop 닫힘이라 onClose 미호출
      expect(fake.state()).toEqual(p.dummyOf(0));

      // base는 여전히 살아있고 정상 닫힘 가능
      act(() => {
        fake.userBack();
      });
      expect(p.baseOnClose).toHaveBeenCalledTimes(1);
    });

    it("H13: 3중첩에서 중간이 닫혀도 back 1회는 top만 닫고 고아만 스킵한다", async () => {
      const aApi = createApiRef();
      const bApi = createApiRef();
      const cApi = createApiRef();
      const aClose = vi.fn();
      const bClose = vi.fn();
      const cClose = vi.fn();

      function Triple({ bOpen }: { bOpen: boolean }) {
        return (
          <>
            <Host open={true} onClose={aClose} api={aApi} />
            <Host open={bOpen} onClose={bClose} api={bApi} />
            <Host open={true} onClose={cClose} api={cApi} />
          </>
        );
      }

      const view = render(<Triple bOpen={true} />);
      expect(fake.pushStateSpy).toHaveBeenCalledTimes(3);
      const dummyA = fake.pushStateSpy.mock.calls[0][0];

      // 중간(B)만 prop 닫힘 → 고아 등록
      view.rerender(<Triple bOpen={false} />);

      act(() => {
        fake.userBack();
      });

      expect(cClose).toHaveBeenCalledTimes(1);
      expect(aClose).toHaveBeenCalledTimes(0);
      // B 더미는 스킵되어 base(A) 더미 위에 착지
      expect(fake.state()).toEqual(dummyA);
    });

    it("H14: 외부 pushState가 최상단에 있어도 pop마다 한 겹씩, 루프 없음", async () => {
      const p = mountPair(fake);

      act(() => {
        window.history.pushState({ external: true }, "");
      });

      act(() => {
        fake.userBack(); // X 제거 → editor 더미 착지
      });
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      p.update({ baseOpen: true, editorOpen: false });

      act(() => {
        fake.userBack(); // editor 더미 제거 → base 더미 착지
      });
      expect(p.baseOnClose).toHaveBeenCalledTimes(1);
      p.update({ baseOpen: false, editorOpen: false });

      act(() => {
        fake.userBack(); // base 더미 제거 → 페이지
      });
      expect(fake.state()).toBeNull();
      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(0); // 훅 발 back 없음
      });
    });

    it("H15: 닫고 곧바로 다시 열면 새 더미로 독립 동작한다", async () => {
      const { onClose, setOpen } = mountOpenHost();

      setOpen(false);
      await waitFor(() => {
        expect(fake.backSpy).toHaveBeenCalledTimes(1);
      });

      setOpen(true);
      expect(fake.pushStateSpy).toHaveBeenCalledTimes(2);
      const first = fake.pushStateSpy.mock.calls[0][0] as {
        __motileSheetModal: string;
      };
      const second = fake.pushStateSpy.mock.calls[1][0] as {
        __motileSheetModal: string;
      };
      expect(second.__motileSheetModal).not.toBe(first.__motileSheetModal);

      act(() => {
        fake.userBack();
      });
      expect(onClose).toHaveBeenCalledTimes(1); // 한 번만 닫힘
    });

    it("H16: StrictMode에서도 push 1회·등록 1개·닫힘 1회", async () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const api = createApiRef();
      const onClose = vi.fn();
      const view = render(
        <StrictMode>
          <Host open={true} onClose={onClose} api={api} />
        </StrictMode>
      );

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(1);

      act(() => {
        fake.userBack();
      });
      expect(onClose).toHaveBeenCalledTimes(1);

      view.unmount();
      const popstateAdds = addSpy.mock.calls.filter(
        (c) => c[0] === "popstate"
      ).length;
      const popstateRemoves = removeSpy.mock.calls.filter(
        (c) => c[0] === "popstate"
      ).length;
      expect(popstateAdds).toBeGreaterThan(0);
      expect(popstateAdds).toBe(popstateRemoves);

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("H17: base enabled=false + 편집 enabled 혼합 — 편집만 히스토리에 참여", async () => {
      const p = mountPair(fake, false /* baseEnabled */);

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(1); // 편집 것만

      act(() => {
        fake.userBack();
      });
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      p.update({ baseOpen: true, editorOpen: false });

      act(() => {
        fake.userBack();
      });
      expect(p.baseOnClose).toHaveBeenCalledTimes(0); // 미등록이므로 불변
    });

    it("H18: 열린 채 unmount되면 back 없이 리스너만 정리된다", async () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { view } = mountOpenHost();

      view.unmount();

      expect(fake.backSpy).toHaveBeenCalledTimes(0);
      const popstateRemoves = removeSpy.mock.calls.filter(
        (c) => c[0] === "popstate"
      ).length;
      expect(popstateRemoves).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });

    it("H19: 아래(base) 시트가 unmount된 뒤 back은 편집만 닫는다(고스트 착지)", async () => {
      const p = mountPair(fake);
      const dummyA = p.dummyOf(0);

      // base만 unmount (열린 채)
      p.update({ baseOpen: true, editorOpen: true, mountBase: false });

      act(() => {
        fake.userBack();
      });
      expect(p.editorOnClose).toHaveBeenCalledTimes(1);
      expect(p.baseOnClose).toHaveBeenCalledTimes(0);
      // base 더미는 고스트로 남아 그 위에 착지 (오늘의 unmount 시맨틱과 동일)
      expect(fake.state()).toEqual(dummyA);
    });

    it("H20: 시트가 2개여도 popstate 리스너는 1개만 등록된다", async () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      mountPair(fake);

      const popstateAdds = addSpy.mock.calls.filter(
        (c) => c[0] === "popstate"
      ).length;
      expect(popstateAdds).toBe(1);
      addSpy.mockRestore();
    });
  });
});
