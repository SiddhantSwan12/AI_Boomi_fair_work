const requestLog = new Map<string, number[]>();

export function rateLimit(
    ip: string,
    { max = 10, windowMs = 60_000 }: { max?: number; windowMs?: number } = {}
): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > cutoff);

    if (timestamps.length >= max) {
        const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
        return { allowed: false, retryAfter };
    }

    timestamps.push(now);
    requestLog.set(ip, timestamps);
    return { allowed: true };
}

export function getIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "anonymous";
}
