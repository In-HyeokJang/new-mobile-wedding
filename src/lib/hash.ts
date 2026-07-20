import { createHash } from "crypto";

// 방명록 삭제용 4자리 PIN 해시(경량 목적).
// 은행 수준 보안이 아니라 "본인 글 삭제" 확인용이라 sha256로 충분.
export function hashPin(pin: string, name: string): string {
  return createHash("sha256")
    .update(`${name}:${pin}:wedding-salt`)
    .digest("hex");
}
