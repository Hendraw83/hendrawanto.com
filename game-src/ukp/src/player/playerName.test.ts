import {describe,expect,it} from "vitest";
import {displayPlayerName,filterPlayerNameInput,normalizePlayerName,PLAYER_NAME_MAX_LENGTH} from "./playerName";

describe("player name",()=>{
  it("membersihkan karakter berbahaya dan spasi berulang",()=>{
    expect(normalizePlayerName("  Aa   <Hendra>  ")).toBe("Aa Hendra");
  });

  it("membatasi panjang nama untuk menjaga layout",()=>{
    expect(filterPlayerNameInput("A".repeat(40))).toHaveLength(PLAYER_NAME_MAX_LENGTH);
  });

  it("menggunakan AvatarMu sebelum nama diisi",()=>{
    expect(displayPlayerName("   ")).toBe("AvatarMu");
  });
});
