import { StrictMode, useState } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type FakeHistory, installFakeHistory } from "@/test/fakeHistory";
import { act, render, screen, userEvent } from "@/test/utils";

import { Sheet } from "../Sheet/Sheet";
import { Modal } from "./Modal";

/**
 * Modal `enableHistoryClose`(옵트인) 테스트.
 *
 * - [무파손] flag 미지정(기본 false) 시 히스토리에 전혀 관여하지 않고
 *   모든 닫기 경로가 동기 onOpenChange(false)로 붕괴한다(기존 v1.4.0 동작 고정).
 * - [옵트인] flag 활성 시 더미 히스토리 push + 브라우저 뒤로가기 닫기,
 *   그리고 backdrop 이중 경로(mousedown/click)가 history.back()을 1회로 dedup됨을 고정.
 * - [중첩] Sheet과 동일한 module-scope 레지스트리를 공유해 Modal-over-Sheet에서
 *   뒤로가기 한 번이 top(Modal)만 닫는다.
 *
 * happy-dom 동기 popstate + FakeHistory 헬퍼로 결정적으로 검증한다.
 */

type CloseOnBackdrop =
  | boolean
  | { clickOutside?: boolean; escapeKey?: boolean };

function ModalHarness({
  enableHistoryClose,
  closeOnBackdrop,
  onChange,
}: {
  enableHistoryClose?: boolean;
  closeOnBackdrop?: CloseOnBackdrop;
  onChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => {
        onChange(next);
        setOpen(next);
      }}
      enableHistoryClose={enableHistoryClose}
    >
      <Modal.Overlay closeOnBackdrop={closeOnBackdrop ?? true}>
        <Modal.Content>
          <Modal.Body>모달 본문</Modal.Body>
          <Modal.Close>닫기</Modal.Close>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
}

/**
 * Sheet + Modal 중첩. 렌더(=effect) 순서대로 더미가 쌓인다.
 * - modalFirst=false(기본): Sheet(아래) → Modal(위), 스택 [Sheet, Modal]
 * - modalFirst=true: Modal(아래) → Sheet(위), 스택 [Modal, Sheet]
 */
function NestHarness({
  onSheet,
  onModal,
  modalFirst = false,
}: {
  onSheet: (open: boolean) => void;
  onModal: (open: boolean) => void;
  modalFirst?: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const sheet = (
    <Sheet.Root
      key="sheet"
      open={sheetOpen}
      onOpenChange={(next) => {
        onSheet(next);
        setSheetOpen(next);
      }}
    >
      <Sheet.Portal>
        <Sheet.Overlay />
        <Sheet.Content>
          <Sheet.Body>시트 본문</Sheet.Body>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  );
  const modal = (
    <Modal.Root
      key="modal"
      open={modalOpen}
      onOpenChange={(next) => {
        onModal(next);
        setModalOpen(next);
      }}
      enableHistoryClose
    >
      <Modal.Overlay>
        <Modal.Content>
          <Modal.Body>모달 본문</Modal.Body>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  );
  return <>{modalFirst ? [modal, sheet] : [sheet, modal]}</>;
}

const getBackdrop = () =>
  document.querySelector(".motile-modal__backdrop") as HTMLElement;

describe("Modal — enableHistoryClose", () => {
  let fake: FakeHistory;

  beforeEach(() => {
    fake = installFakeHistory();
  });

  afterEach(() => {
    fake.restore();
  });

  describe("무파손 — flag 미지정 (기본 false)", () => {
    it("열려도 더미 히스토리를 push하지 않는다 (리스너 미등록)", () => {
      render(<ModalHarness onChange={vi.fn()} />);

      expect(fake.pushStateSpy).not.toHaveBeenCalled();
      expect(fake.index()).toBe(0);
      expect(
        (fake.state() as { __motileSheetModal?: unknown } | null)
          ?.__motileSheetModal
      ).toBeUndefined();
    });

    it("브라우저 뒤로가기로 닫히지 않는다", () => {
      const onChange = vi.fn();
      render(<ModalHarness onChange={onChange} />);

      act(() => {
        fake.userBack();
      });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByText("모달 본문")).toBeInTheDocument();
    });

    it("Close 버튼은 history.back() 없이 onOpenChange(false)로 닫는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness onChange={onChange} />);

      await user.click(screen.getByText("닫기"));

      expect(onChange).toHaveBeenCalledWith(false);
      expect(fake.backSpy).not.toHaveBeenCalled();
    });

    it("ESC는 history.back() 없이 onOpenChange(false)로 닫는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness onChange={onChange} />);

      await user.keyboard("{Escape}");

      expect(onChange).toHaveBeenCalledWith(false);
      expect(fake.backSpy).not.toHaveBeenCalled();
    });

    it("backdrop 클릭은 history.back() 없이 onOpenChange(false)로 닫는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness onChange={onChange} />);

      await user.click(getBackdrop());

      expect(onChange).toHaveBeenCalledWith(false);
      expect(fake.backSpy).not.toHaveBeenCalled();
      expect(screen.queryByText("모달 본문")).not.toBeInTheDocument();
    });
  });

  describe("옵트인 — enableHistoryClose", () => {
    it("열릴 때 더미 히스토리를 정확히 1개 push한다", () => {
      render(<ModalHarness enableHistoryClose onChange={vi.fn()} />);

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(1);
      expect(
        typeof (fake.state() as { __motileSheetModal?: unknown })
          .__motileSheetModal
      ).toBe("string");
      expect(fake.index()).toBe(1);
    });

    it("브라우저 뒤로가기로 닫히고(onOpenChange(false) 1회) 더미를 정리한다", () => {
      const onChange = vi.fn();
      render(<ModalHarness enableHistoryClose onChange={onChange} />);

      act(() => {
        fake.userBack();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
      expect(screen.queryByText("모달 본문")).not.toBeInTheDocument();
      expect(fake.index()).toBe(0);
    });

    it("[dedup 핵심] backdrop 클릭당 history.back()은 정확히 1회다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness enableHistoryClose onChange={onChange} />);

      await user.click(getBackdrop());

      expect(fake.backSpy).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("Close 버튼은 history.back()으로 닫고 더미를 정리한다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness enableHistoryClose onChange={onChange} />);

      await user.click(screen.getByText("닫기"));

      expect(fake.backSpy).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
      expect(fake.index()).toBe(0);
      expect(
        (fake.state() as { __motileSheetModal?: unknown } | null)
          ?.__motileSheetModal
      ).toBeUndefined();
    });

    it("ESC는 history.back()으로 닫는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ModalHarness enableHistoryClose onChange={onChange} />);

      await user.keyboard("{Escape}");

      expect(fake.backSpy).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("closeOnBackdrop=false여도 브라우저 뒤로가기로는 닫힌다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <ModalHarness
          enableHistoryClose
          closeOnBackdrop={false}
          onChange={onChange}
        />
      );

      // ESC·backdrop 무반응
      await user.keyboard("{Escape}");
      await user.click(getBackdrop());
      expect(onChange).not.toHaveBeenCalled();
      expect(fake.backSpy).not.toHaveBeenCalled();

      // 브라우저 뒤로가기로는 닫힘
      act(() => {
        fake.userBack();
      });
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("StrictMode에서도 더미를 정확히 1개만 push한다", () => {
      render(
        <StrictMode>
          <ModalHarness enableHistoryClose onChange={vi.fn()} />
        </StrictMode>
      );

      expect(fake.pushStateSpy).toHaveBeenCalledTimes(1);
      expect(fake.index()).toBe(1);
    });
  });

  describe("중첩 — 공유 레지스트리", () => {
    it("Modal-over-Sheet: 뒤로가기 한 번은 top(Modal)만 닫고 아래 Sheet는 유지한다", () => {
      const onSheet = vi.fn();
      const onModal = vi.fn();
      render(<NestHarness onSheet={onSheet} onModal={onModal} />);

      expect(screen.getByText("시트 본문")).toBeInTheDocument();
      expect(screen.getByText("모달 본문")).toBeInTheDocument();

      act(() => {
        fake.userBack();
      });

      // top(Modal)만 닫힘 — Sheet은 유지
      expect(onModal).toHaveBeenCalledWith(false);
      expect(onSheet).not.toHaveBeenCalled();
      expect(screen.queryByText("모달 본문")).not.toBeInTheDocument();
      expect(screen.getByText("시트 본문")).toBeInTheDocument();
    });

    it("Sheet-over-Modal: 뒤로가기 한 번은 top(Sheet)만 닫고 아래 Modal은 유지한다", () => {
      const onSheet = vi.fn();
      const onModal = vi.fn();
      render(<NestHarness modalFirst onSheet={onSheet} onModal={onModal} />);

      act(() => {
        fake.userBack();
      });

      // top(Sheet)만 닫힘 — Modal은 유지
      expect(onSheet).toHaveBeenCalledWith(false);
      expect(onModal).not.toHaveBeenCalled();
      expect(screen.queryByText("시트 본문")).not.toBeInTheDocument();
      expect(screen.getByText("모달 본문")).toBeInTheDocument();
    });
  });
});
