import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createHash } from "crypto";

function getSecretKey(): Uint8Array {
  if (process.env.SECRET_KEY) {
    return new TextEncoder().encode(process.env.SECRET_KEY);
  }
  // 使用固定派生密钥作为 fallback，避免每次重启导致所有用户 token 失效
  const fallbackKey = createHash("sha256")
    .update("Ddmer-Kirameku-Blog-Default-Secret-Key-v1")
    .digest("hex");
  return new TextEncoder().encode(fallbackKey);
}

const SECRET_KEY = getSecretKey();
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_HOURS = 72;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRE_HOURS}h`)
    .sign(SECRET_KEY);
}

export async function decodeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      clockTolerance: 60,
    });
    return payload;
  } catch {
    throw new Error("无效的令牌");
  }
}

export async function getCurrentUser(request: Request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    throw new Error("未登录");
  }
  const token = auth.slice(7);
  return decodeToken(token);
}
