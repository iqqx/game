export function Clamp(n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max);
}

export function Lerp(start: number, end: number, t: number) {
	return start * (1 - t) + end * t;
}
