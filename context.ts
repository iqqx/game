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

export function DrawCircle(x: number, y: number, radius: number) {
	ctx.beginPath()
	ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
	ctx.fill()
}

export function Clear() {
	ctx.resetTransform();
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function DrawRectangleWithAngle(
	x: number,
	y: number,
	width: number,
	height: number,
	angle: number,
	xPivot: number,
	yPivot: number
) {
	var prev = ctx.getTransform();

	ctx.translate(x, ctx.canvas.height - height - y);
	ctx.rotate(angle);
	ctx.fillRect(xPivot, yPivot, width, height);

	ctx.setTransform(prev);
}
