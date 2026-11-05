import { db, send, body, hash, newKey, NOT_CONFIGURED } from "../_lib.js";
import { createRoomData } from "../_logic.js";
import { CODE_ALPHABET } from "../../public/veto-engine.js";

const genCode = () => Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");

// POST /api/rooms  {meta}  ->  {code, hostKey, rev, data}
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Use POST to create a room" });
  const sb = db();
  if (!sb) return send(res, 500, { error: NOT_CONFIGURED });

  const made = createRoomData(body(req).meta, Date.now());
  if (made.error) return send(res, 400, { error: made.error });
  const data = made.data, hostKey = newKey();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = genCode();
    const { error } = await sb.from("rooms").insert({ code, rev: 1, data });
    if (error) {
      if (error.code === "23505") continue; // code already used, try another
      return send(res, 500, { error: "The room couldn't be saved. Check the Supabase setup and try again" });
    }
    const { error: kerr } = await sb.from("room_keys").insert({ code, host_hash: hash(hostKey) });
    if (kerr) {
      await sb.from("rooms").delete().eq("code", code);
      return send(res, 500, { error: "The room couldn't be saved. Check the Supabase setup and try again" });
    }
    return send(res, 201, { code, hostKey, rev: 1, data });
  }
  return send(res, 503, { error: "Couldn't find a free room code. Try again" });
}
