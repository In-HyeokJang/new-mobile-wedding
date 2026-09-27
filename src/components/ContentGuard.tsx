"use client";

import { useEffect } from "react";

// 우클릭 / 개발자도구 단축키 / 드래그 차단.
//
// 보안 장치가 아니다. 브라우저 메뉴로 개발자도구를 열거나 view-source: 를 치면
// 그대로 다 보인다. 목적은 "하객이 사진을 무심코 저장하거나 퍼가는 걸
// 한 단계 귀찮게 만드는 것" 까지다.
//
// 실제 타깃이 모바일이라는 점이 중요하다. 폰에는 F12 도 우클릭도 없고,
// 사진이 새는 경로는 대부분 '길게 눌러 이미지 저장' 이다.
// 그건 globals.css 의 -webkit-touch-callout: none 이 막는다.
export default function ContentGuard() {
  useEffect(() => {
    // 우클릭 + 모바일 롱프레스 컨텍스트 메뉴 — 사진에서만 막는다.
    // 페이지 전체를 막으면 안드로이드에서 계좌번호를 길게 눌러 복사하는 것까지 막힌다
    const onContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };

    // 이미지 드래그해서 끌어내기
    const onDragStart = (e: DragEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();

      // F12
      if (k === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / J / C — 개발자도구, 콘솔, 요소 선택
      if (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) {
        e.preventDefault();
        return;
      }
      // Ctrl+U 소스 보기 / Ctrl+S 페이지 저장
      if (e.ctrlKey && (k === "U" || k === "S")) {
        e.preventDefault();
      }
      // Ctrl+V(붙여넣기)는 막지 않는다 — 방명록 입력을 망친다
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
