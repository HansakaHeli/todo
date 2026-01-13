import jwt from "jsonwebtoken";
import { getAuthContextByUserId } from "../auth/service";
/**
 * JWT auth middleware:
 * - expects `Authorization: Bearer <token>`
 */
export async function requireAuth(req, res, next) {
    const header = req.header("authorization") ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        res.status(401).json({ error: "Unauthorized", message: "Missing Authorization Bearer token" });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: "Server Misconfigured", message: "Missing JWT_SECRET" });
        return;
    }
    try {
        const payload = jwt.verify(token, secret);
        const userId = payload.sub;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
            return;
        }
        const ctx = await getAuthContextByUserId(userId);
        if (!ctx) {
            res.status(401).json({ error: "Unauthorized", message: "User not found" });
            return;
        }
        req.auth = ctx;
        next();
    }
    catch {
        res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    }
}
