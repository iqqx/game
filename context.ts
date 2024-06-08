import { Clamp, Color, Lerp, Rectangle } from "./utilites.js";

const ctx = (
	document.getElementById("main-canvas") as HTMLCanvasElement
).getContext("2d");
ctx.imageSmoothingEnabled = false;

export const levelLength = 2000;
let levelPosition = 0;
let needLevelPosition = 0;

export function GetFillColor() {
	return ctx.fillStyle;
}

export function SetFillColor(color: string | CanvasGradient | CanvasPattern) {
	ctx.fillStyle = color;
}

export function SetFillColorRGB(r: number, g: number, b: number) {
	ctx.fillStyle = `rgb(${r},${g},${b})`;
}

export function SetFillColorRGBA(color: Color) {
	ctx.fillStyle = color.toString();
}

export function ResetTransform() {
	ctx.resetTransform();
}

export function Translate(x: number, y: number) {
	ctx.translate(x, y);
}

export function DrawRectangle(
	x: number,
	y: number,
	width: number,
	height: number
) {
	ctx.fillRect(
		x - levelPosition,
		ctx.canvas.height - y - height,
		width,
		height
	);
}

export function DrawRectangleEx(rect: Rectangle) {
	ctx.fillRect(
		rect.X - levelPosition,
		ctx.canvas.height - rect.Y - rect.Height,
		rect.Width,
		rect.Height
	);
}

export function DrawImage(image: CanvasImageSource, rect: Rectangle) {
	ctx.drawImage(
		image,
		rect.X - levelPosition,
		ctx.canvas.height - rect.Height - rect.Y,
		rect.Width,
		rect.Height
	);
}

export function DrawImageFlipped(image: CanvasImageSource, rect: Rectangle) {
	ctx.save();
	ctx.scale(-1, 1);
	ctx.drawImage(
		image,
		-rect.X - rect.Width + levelPosition,
		ctx.canvas.height - rect.Height - rect.Y,
		rect.Width,
		rect.Height
	);
	ctx.restore();
}

export function DrawRectangleFixed(
	x: number,
	y: number,
	width: number,
	height: number
) {
	ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
}

export function DrawCircle(x: number, y: number, radius: number) {
	ctx.beginPath();
	ctx.ellipse(
		x - levelPosition,
		ctx.canvas.height - radius / 2 - y,
		radius,
		radius,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();
}

export function Clear() {
	ctx.resetTransform();
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function SetLevelPosition(position: number) {
	needLevelPosition = Clamp(position - 750 - 50, 0, levelLength - 1500);
}

export function GetLevelPosition() {
	return levelPosition;
}

export function ProgradeLerp() {
	levelPosition = Lerp(levelPosition, needLevelPosition, 0.1);
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

	ctx.resetTransform();
	ctx.translate(x - levelPosition, ctx.canvas.height - y);
	ctx.rotate(angle);
	ctx.fillRect(xPivot, yPivot - height, width, height);

	ctx.setTransform(prev);
}

export function DrawImageWithAngle(
	image: CanvasImageSource,
	rect: Rectangle,
	angle: number,
	xPivot: number,
	yPivot: number
) {
	var prev = ctx.getTransform();

	ctx.resetTransform();
	ctx.translate(rect.X - levelPosition, ctx.canvas.height - rect.Y);
	ctx.rotate(angle);

	ctx.drawImage(image, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

	ctx.setTransform(prev);
}

export function DrawImageWithAngleVFlipped(
	image: CanvasImageSource,
	rect: Rectangle,
	angle: number,
	xPivot: number,
	yPivot: number
) {
	ctx.save();

	ctx.resetTransform();
	ctx.translate(rect.X - levelPosition, ctx.canvas.height - rect.Y);
	ctx.rotate(angle);
	ctx.scale(1, -1);

	ctx.drawImage(image, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

	ctx.restore();
}

export function SetHorizontalFlip(flipped: boolean) {
	ctx.scale(flipped ? -1 : 1, 1);
}

export function DrawText(x: number, y: number, text: string) {
	ctx.fillText(text, x, y);
}

export function DrawVignette(color: Color) {
	var outerRadius = 1500 * 0.6;
	var innerRadius = 1500 * 0.5;
	var grd = ctx.createRadialGradient(
		1500 / 2,
		750 / 2,
		innerRadius,
		1500 / 2,
		750 / 2,
		outerRadius
	);
	grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, .1)`);
	grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, .6)`);

	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, 1500, 750);
}

export function DrawRectangleWithGradient(
	rect: Rectangle,
	start: Color,
	end: Color
) {
	const grd = ctx.createLinearGradient(
		rect.X - levelPosition,
		ctx.canvas.height - rect.Height - rect.Y,
		rect.X - levelPosition + rect.Width,
		ctx.canvas.height - rect.Height - rect.Y + rect.Height
	);

	grd.addColorStop(0, start.toString());
	grd.addColorStop(1, end.toString());

	ctx.fillStyle = grd;
	DrawRectangle(rect.X - levelPosition, rect.Y, rect.Width, rect.Height);
}

export function DrawRectangleWithGradientAndAngle(
	rect: Rectangle,
	start: [number, Color],
	end: [number, Color],
	angle: number,
	xPivot: number,
	yPivot: number
) {
	const grd = ctx.createLinearGradient(
		xPivot,
		yPivot - rect.Height,
		rect.Width,
		rect.Height
	);

	grd.addColorStop(start[0], start[1].toString());
	grd.addColorStop(end[0], end[1].toString());
	ctx.fillStyle = grd;

	DrawRectangleWithAngle(
		rect.X,
		rect.Y,
		rect.Width,
		rect.Height,
		angle,
		xPivot,
		yPivot
	);
}

export function GetClientRectangle() {
	return ctx.canvas.getBoundingClientRect();
}
