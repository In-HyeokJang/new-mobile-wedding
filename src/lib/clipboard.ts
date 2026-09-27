// 클립보드 복사 (계좌번호 / 주소 / 링크 공용).
//
// navigator.clipboard 는 카카오톡 인앱 브라우저·구형 삼성인터넷 등에서
// 권한 거부로 실패하는 경우가 있다. 그때는 숨긴 textarea 를 선택해
// execCommand('copy') 로 한 번 더 시도한다(구식이지만 WebView 에서 가장 잘 먹힌다).
// 둘 다 실패하면 false 를 돌려주고, 호출한 쪽이 "길게 눌러 복사" 안내를 띄운다.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 아래 폴백으로 */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    // 화면 밖에 두되 display:none 은 안 된다(선택이 안 됨)
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.fontSize = "16px"; // iOS 에서 포커스 시 화면 확대 방지
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
