import { Color, Rectangle, Sprite, Vector2 } from "./Utilites.js";

const ctxMain = (document.getElementById("main-canvas") as HTMLCanvasElement).getContext("2d");
ctxMain.imageSmoothingEnabled = false;

const ctxOverlay = document.createElement("canvas").getContext("2d");
ctxOverlay.canvas.width = 1500;
ctxOverlay.canvas.height = 750;
ctxOverlay.imageSmoothingEnabled = false;

let ctx = ctxMain;

export namespace Canvas {
	export function SwitchLayer(onMain = true) {
		if (onMain) {
			ctxMain.drawImage(ctxOverlay.canvas, 0, 0);
			ctx = ctxMain;
		} else ctx = ctxOverlay;
	}

	export function EraseRectangle(x: number, y: number, width: number, height: number) {
		ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
	}

	export function SetFillColor(color: Color) {
		ctx.fillStyle = color.toString();
	}

	export function SetStroke(color: Color, width: number) {
		ctx.strokeStyle = color.toString();
		ctx.lineWidth = width;
	}

	export function ResetTransform() {
		ctx.resetTransform();
	}

	export function Translate(x: number, y: number) {
		ctx.translate(x, y);
	}

	export function DrawRectangle(x: number, y: number, width: number, height: number) {
		ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
	}

	export function DrawRectangleEx(rect: Rectangle) {
		ctx.beginPath();
		ctx.rect(rect.X, ctx.canvas.height - rect.Y - rect.Height, rect.Width, rect.Height);
		ctx.fill();
		ctx.stroke();
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
		var prev = ctx.getTransform();

		ctx.resetTransform();
		ctx.translate(x, ctx.canvas.height - y);
		ctx.rotate(angle);

		ctx.fillRect(xPivot, yPivot - height, width, height);

		ctx.setTransform(prev);
	}

	export function DrawRectangleWithAngleAndStroke(x: number, y: number, width: number, height: number, angle: number, xPivot: number, yPivot: number) {
		var prev = ctx.getTransform();

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

	export function DrawText(x: number, y: number, text: string) {
		ctx.fillText(text, x, y);
	}

	export function DrawTextEx(x: number, y: number, text: string, size: number) {
		ctx.font = size + "px arial";
		ctx.fillText(text, x, y);
	}

	export function DrawVignette(color: Color) {
		var outerRadius = 1500 * 0.6;
		var innerRadius = 1500 * 0.5;
		var grd = ctx.createRadialGradient(1500 / 2, 750 / 2, innerRadius, 1500 / 2, 750 / 2, outerRadius);
		grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, .1)`);
		grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, .6)`);

		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, 1500, 750);
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
