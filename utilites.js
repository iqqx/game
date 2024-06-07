export function Clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
export function Lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
