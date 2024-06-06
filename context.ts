const ctx = (
	document.getElementById("main-canvas") as HTMLCanvasElement
).getContext("2d");

export function GetFillColor() {
	return ctx.fillStyle;
}

export function SetFillColor(color: string | CanvasGradient | CanvasPattern) {
	ctx.fillStyle = color;
}

export function DrawRectangle(
	x: number,
	y: number,
	width: number,
	height: number
) {
	ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
}

export function Clear() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
