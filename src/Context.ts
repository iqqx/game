/* eslint-disable @typescript-eslint/no-namespace */
import { Color, Rectangle, Sprite, Vector2 } from "./Utilites.js";

const ctxMain = (document.getElementById("main-canvas") as HTMLCanvasElement).getContext("2d");
ctxMain.imageSmoothingEnabled = false;

const ctxOverlay = document.createElement("canvas").getContext("2d");
// ctxOverlay.canvas.width = ctxMain.canvas.clientWidth;
// ctxOverlay.canvas.height = ctxMain.canvas.clientHeight;
ctxOverlay.canvas.width = ctxMain.canvas.width;
ctxOverlay.canvas.height = ctxMain.canvas.height;
ctxOverlay.imageSmoothingEnabled = false;

let ctx = ctxMain;

let fillStyle: string | CanvasGradient | CanvasPattern | null;
let strokeStyle: [string | CanvasGradient | CanvasPattern, number] | null;

export namespace Canvas {
	export function SwitchLayer(onMain = true) {
		if (onMain) {
			ctxMain.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
			ctx = ctxMain;
		} else ctx = ctxOverlay;
	}

	export function EraseRectangle(x: number, y: number, width: number, height: number) {
		ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
	}

	export function SetFillColor(color: Color) {
		ctx.fillStyle = color.toString();

		fillStyle = color.toString();
	}

	export function ClearFillColor() {
		fillStyle = null;
	}

	export function ClearStroke() {
		strokeStyle = null;
	}

	export function SetStroke(color: Color, width: number) {
		ctx.strokeStyle = color.toString();
		ctx.lineWidth = width;

		strokeStyle = [color.toString(), width];
	}

	export function SetFillRadialGradient(rect: Rectangle, start: Color, end: Color) {
		const grd = ctx.createRadialGradient(
			rect.X + rect.Width / 2,
			ctx.canvas.height - rect.Height * 0.5 - rect.Y,
			0,
			rect.X + rect.Width / 2,
			ctx.canvas.height - rect.Height * 0.5 - rect.Y,
			Math.max(rect.Width, rect.Height) * 2
		);

		grd.addColorStop(0, start.toString());
		grd.addColorStop(1, end.toString());

		ctx.fillStyle = grd;
	}

	export function ResetTransform() {
		ctx.resetTransform();
	}

	export function Translate(x: number, y: number) {
		ctx.translate(x, y);
	}

	export function ClearRectangle(x: number, y: number, width: number, height: number) {
		ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
	}

	export function DrawRectangle(x: number, y: number, width: number, height: number) {
		ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
	}

	export function DrawRectangleEx(rect: Rectangle) {
		ctx.beginPath();
		ctx.rect(rect.X, ctx.canvas.height - rect.Y, rect.Width, -rect.Height);
		if (fillStyle !== null) ctx.fill();
		if (strokeStyle !== null) ctx.stroke();
	}

	export function DrawRectangleRounded(rect: Rectangle, round: number) {
		ctx.beginPath();
		ctx.roundRect(rect.X, ctx.canvas.height - rect.Y, rect.Width, -rect.Height, round);
		ctx.fill();
	}

	export function DrawImage(image: Sprite, rect: Rectangle) {
		ctx.drawImage(
			image.Image,
			image.BoundingBox.X,
			image.BoundingBox.Y,
			image.BoundingBox.Width,
			image.BoundingBox.Height,
			rect.X,
			ctx.canvas.height - rect.Height - rect.Y,
			rect.Width,
			rect.Height
		);
	}

	export function DrawBackground(image: Sprite, offset: number) {
		const ratio = image.Image.naturalHeight / ctx.canvas.height;

		ctx.drawImage(image.Image, Math.round(offset * ratio), 0, Math.round(ctx.canvas.width * ratio), image.Image.naturalHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	export function GetSize() {
		return new Vector2(ctx.canvas.width, ctx.canvas.height);
	}

	export function DrawImageProportional(image: HTMLImageElement, rect: Rectangle) {
		const ratio = Math.min(rect.Height, rect.Width) / Math.max(image.naturalWidth, image.naturalHeight);

		const newHeight = image.naturalHeight * ratio;

		const offsetY = (rect.Height - newHeight) / 2;

		ctx.drawImage(image, rect.X, ctx.canvas.height - rect.Height - rect.Y + offsetY, rect.Width * ratio, newHeight);
	}

	export function DrawImageFlipped(image: Sprite, rect: Rectangle) {
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(
			image.Image,
			image.BoundingBox.X,
			image.BoundingBox.Y,
			image.BoundingBox.Width,
			image.BoundingBox.Height,
			-rect.X - rect.Width,
			ctx.canvas.height - rect.Height - rect.Y,
			rect.Width,
			rect.Height
		);
		ctx.restore();
	}

	export function DrawCircle(x: number, y: number, radius: number) {
		ctx.beginPath();
		ctx.ellipse(x, ctx.canvas.height - radius / 2 - y, radius, radius, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	export function DrawRectangleWithAngle(x: number, y: number, width: number, height: number, angle: number, xPivot: number, yPivot: number) {
		const prev = ctx.getTransform();

		ctx.resetTransform();
		ctx.translate(x, ctx.canvas.height - y);
		ctx.rotate(angle);

		ctx.fillRect(xPivot, yPivot - height, width, height);

		ctx.setTransform(prev);
	}

	export function DrawRectangleWithAngleAndStroke(x: number, y: number, width: number, height: number, angle: number, xPivot: number, yPivot: number) {
		const prev = ctx.getTransform();

		ctx.resetTransform();
		ctx.translate(x, ctx.canvas.height - y);
		ctx.rotate(angle);

		ctx.beginPath();
		ctx.rect(xPivot, yPivot - height, width, height);
		ctx.fill();
		ctx.stroke();

		ctx.setTransform(prev);
	}

	export function DrawImageEx() {}

	export function DrawImageWithAngle(image: Sprite, rect: Rectangle, angle: number, xPivot: number, yPivot: number) {
		ctx.save();

		ctx.resetTransform();
		// ctx.translate(rect.X - levelPosition, ctx.canvas.height - rect.Y);
		ctx.translate(rect.X, ctx.canvas.height - rect.Y);
		ctx.rotate(angle);

		// ctx.drawImage(image.Image, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
		ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		ctx.restore();
	}

	export function DrawImageWithAngleVFlipped(image: Sprite, rect: Rectangle, angle: number, xPivot: number, yPivot: number) {
		ctx.save();

		ctx.resetTransform();
		ctx.translate(rect.X, ctx.canvas.height - rect.Y);
		ctx.rotate(angle);
		ctx.scale(1, -1);

		ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		ctx.restore();
	}

	export function DrawVignette(color: Color, startAlpha?: number, endAlpha?: number) {
		const outerRadius = ctx.canvas.width * 0.6;
		const innerRadius = ctx.canvas.width * 0.5;
		const grd = ctx.createRadialGradient(ctx.canvas.width / 2, ctx.canvas.height / 2, innerRadius, ctx.canvas.width / 2, ctx.canvas.height / 2, outerRadius);
		grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha ?? 0.1})`);
		grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha ?? 0.6})`);

		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	export function DrawRectangleWithGradient(rect: Rectangle, start: Color, end: Color) {
		const grd = ctx.createLinearGradient(
			// rect.X - levelPosition,
			rect.X,
			ctx.canvas.height - rect.Height - rect.Y,
			// rect.X - levelPosition + rect.Width,
			rect.X + rect.Width,
			ctx.canvas.height - rect.Height - rect.Y + rect.Height
		);

		grd.addColorStop(0, start.toString());
		grd.addColorStop(1, end.toString());

		ctx.fillStyle = grd;

		DrawRectangle(rect.X, rect.Y, rect.Width, rect.Height);
	}

	export function DrawRectangleWithGradientAndAngle(rect: Rectangle, start: [number, Color], end: [number, Color], angle: number, xPivot: number, yPivot: number) {
		const grd = ctx.createLinearGradient(xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		grd.addColorStop(start[0], start[1].toString());
		grd.addColorStop(end[0], end[1].toString());
		ctx.fillStyle = grd;

		DrawRectangleWithAngle(rect.X, rect.Y, rect.Width, rect.Height, angle, xPivot, yPivot);
	}

	export function GetClientRectangle() {
		return ctx.canvas.getBoundingClientRect();
	}
}

export namespace GUI {
	export const Width = ctxOverlay.canvas.width;
	export const Height = ctxOverlay.canvas.height;

	export function SetFillColor(color: Color) {
		ctx.fillStyle = color.toString();

		fillStyle = color.toString();
	}

	export function SetStroke(color: Color, width: number) {
		ctx.strokeStyle = color.toString();
		ctx.lineWidth = width;

		strokeStyle = [color.toString(), width];
	}

	export function ClearFillColor() {
		fillStyle = null;
	}

	export function ClearStroke() {
		strokeStyle = null;
	}

	export function SetFont(size: number) {
		ctx.font = `${size}px Consolas`; // Monospace
		ctx.letterSpacing = "2px";
	}

	export function DrawRectangle(x: number, y: number, width: number, height: number) {
		ctx.beginPath();

		ctx.rect(x, y, width, height);

		if (fillStyle !== null) ctx.fill();
		if (strokeStyle !== null) ctx.stroke();
	}

	export function DrawText(x: number, y: number, text: string) {
		ctx.fillText(text, x, y);
	}

	export function DrawTextWithBreakes(text: string, x: number, y: number) {
		const height = ctx.measureText("|").actualBoundingBoxAscent + ctx.measureText("|").actualBoundingBoxDescent;
		const lines = text.split("\n");

		for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, y + i * height);
	}

	export function DrawTextCenter(text: string, x: number, y: number, width: number, height?: number) {
		const textWidth = ctx.measureText(text).width;

		if (height !== undefined) {
			const textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;

			ctx.fillText(text, x + (width - textWidth) / 2, y + (height + textHeight) / 2);
		} else ctx.fillText(text, x + (width - textWidth) / 2, y);
	}

	export function DrawTextClamped(x: number, y: number, text: string, maxWidth: number) {
		const height = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
		const lineCount = Math.floor(maxWidth / ctx.measureText("0").width);

		for (let i = 0; i < Math.ceil(text.length / lineCount); i++) ctx.fillText(text.slice(lineCount * i, lineCount * (i + 1)).toString(), x, y + i * height * 2);
	}

	export function DrawTextWrapped(x: number, y: number, text: string, maxWidth: number) {
		const height = ctx.measureText("0").actualBoundingBoxAscent + ctx.measureText("0").actualBoundingBoxDescent;
		// const lineCount = Math.floor(maxWidth / ctx.measureText("0").width);
		const words = text.split(" ");
		const lines: string[] = [];
		let added = 0;

		for (let l = 0; l < 50; l++) {
			let lastSpace = maxWidth;

			for (let i = 0; i < 50; i++) {
				lastSpace -= ctx.measureText(words[added + i] + " ").width;

				if (lastSpace < 0 || words.length < added + i) {
					lines.push(words.slice(added, added + i).join(" "));
					added += i;
					break;
				}
			}

			ctx.fillText(lines[l], x, y + l * height * 2);
		}

		// for (let i = 0; i < Math.ceil(text.length / lineCount); i++) ctx.fillText(text.slice(lineCount * i, lineCount * (i + 1)).toString(), x, y + i * height * 2);
	}

	export function DrawImage(image: Sprite, x: number, y: number, width: number, height: number) {
		ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, x, y, width, height);
	}
}
