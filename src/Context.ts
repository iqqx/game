import { Color, IsMobile, Rectangle, Sprite, Vector2 } from "./Utilites.js";

const ctxMain = (document.getElementById("main-canvas") as HTMLCanvasElement).getContext("2d");
ctxMain.canvas.width = window.innerWidth;
ctxMain.canvas.height = window.innerHeight;
ctxMain.imageSmoothingEnabled = false;

window.addEventListener("resize", () => {
	ctxMain.canvas.width = window.innerWidth;
	ctxMain.canvas.height = window.innerHeight;
	ctxMain.imageSmoothingEnabled = false;
});

let fillStyle: string | CanvasGradient | CanvasPattern | null;
let strokeStyle: [string | CanvasGradient | CanvasPattern, number] | null;

export class Canvas {
	static get Width() {
		return ctxMain.canvas.width;
	}

	static get Height() {
		return ctxMain.canvas.height;
	}

	public static CameraX = 0;
	public static CameraY = 0;
	public static readonly HTML = ctxMain.canvas;

	public static ToFullscreen() {
		ctxMain.canvas.requestFullscreen();
	}

	public static IsFullscreen() {
		return document.fullscreenElement !== null && (IsMobile() || (Math.abs(window.outerWidth - ctxMain.canvas.width) < 20 && Math.abs(window.outerHeight - ctxMain.canvas.height) < 20));
	}

	public static LockMouse() {
		ctxMain.canvas.requestPointerLock();
	}

	public static SetFillColor(color: Color) {
		ctxMain.fillStyle = color.toString();

		fillStyle = color.toString();
	}

	public static ClearFillColor() {
		fillStyle = null;
	}

	public static ClearStroke() {
		strokeStyle = null;
	}

	public static SetStroke(color: Color, width: number) {
		ctxMain.strokeStyle = color.toString();
		ctxMain.lineWidth = width;

		strokeStyle = [color.toString(), width];
	}

	public static SetFillRadialGradient(rect: Rectangle, start: Color, end: Color) {
		const grd = ctxMain.createRadialGradient(
			rect.X + rect.Width / 2,
			ctxMain.canvas.height - rect.Height * 0.5 - rect.Y,
			0,
			rect.X + rect.Width / 2,
			ctxMain.canvas.height - rect.Height * 0.5 - rect.Y,
			Math.max(rect.Width, rect.Height) * 2
		);

		grd.addColorStop(0, start.toString());
		grd.addColorStop(1, end.toString());

		ctxMain.fillStyle = grd;
	}

	public static DrawRectangle(x: number, y: number, width: number, height: number) {
		ctxMain.fillRect(x - this.CameraX, ctxMain.canvas.height - height - (y - this.CameraY), width, height);
	}

	public static DrawRectangleEx(rect: Rectangle) {
		ctxMain.beginPath();
		ctxMain.rect(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY), rect.Width, -rect.Height);
		if (fillStyle !== null) ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawImage(image: Sprite, rect: Rectangle) {
		if (rect.X < this.CameraX - this.Width || rect.X > this.CameraX + this.Width) return;

		ctxMain.drawImage(
			image.Image,
			image.BoundingBox.X,
			image.BoundingBox.Y,
			image.BoundingBox.Width,
			image.BoundingBox.Height,
			rect.X - this.CameraX,
			ctxMain.canvas.height - rect.Height - (rect.Y - this.CameraY),
			rect.Width,
			rect.Height
		);
	}

	public static GetCameraScale() {
		return ctxMain.canvas.height / 750;
	}

	public static DrawBackground(image: Sprite) {
		// тут Y снизу
		// работает только для горизонтального разрешения

		const viewportScale = image.Image.naturalHeight / ctxMain.canvas.height;
		const standartScale = ctxMain.canvas.height / 750; // вся игра сделана для разрешения 750

		if (standartScale > 1)
			ctxMain.drawImage(
				image.Image,
				Math.round(this.CameraX * viewportScale * standartScale),
				0,
				Math.round(ctxMain.canvas.width * standartScale * viewportScale),
				image.Image.naturalHeight,
				0,
				Math.round((ctxMain.canvas.height - 750) * 0.5),
				ctxMain.canvas.width,
				750
			);
		else
			ctxMain.drawImage(
				image.Image,
				Math.round(this.CameraX * viewportScale * standartScale),
				Math.round(image.Image.naturalHeight * (1 - standartScale) - this.CameraY * (viewportScale * standartScale)),
				Math.round(ctxMain.canvas.width * standartScale * viewportScale),
				Math.round(image.Image.naturalHeight * standartScale),
				0,
				0,
				ctxMain.canvas.width,
				ctxMain.canvas.height
			);
	}

	public static DrawImageFlipped(image: Sprite, rect: Rectangle) {
		if (rect.X < this.CameraX - this.Width || rect.X > this.CameraX + this.Width) return;

		ctxMain.save();
		ctxMain.scale(-1, 1);
		ctxMain.drawImage(
			image.Image,
			image.BoundingBox.X,
			image.BoundingBox.Y,
			image.BoundingBox.Width,
			image.BoundingBox.Height,
			-(rect.X - this.CameraX) - rect.Width,
			ctxMain.canvas.height - rect.Height - (rect.Y - this.CameraY),
			rect.Width,
			rect.Height
		);
		ctxMain.restore();
	}

	public static DrawCircle(x: number, y: number, radius: number) {
		ctxMain.beginPath();
		ctxMain.ellipse(x - this.CameraX, ctxMain.canvas.height - (y - this.CameraY), radius, radius, 0, 0, Math.PI * 2);
		ctxMain.fill();
	}

	public static DrawRectangleWithAngle(x: number, y: number, width: number, height: number, angle: number, xPivot: number, yPivot: number) {
		const prev = ctxMain.getTransform();

		ctxMain.resetTransform();
		ctxMain.translate(x - this.CameraX, ctxMain.canvas.height - (y - this.CameraY));
		ctxMain.rotate(angle);

		ctxMain.fillRect(xPivot, yPivot - height, width, height);

		ctxMain.setTransform(prev);
	}

	public static DrawImageWithAngle(image: Sprite, rect: Rectangle, angle: number, xPivot: number, yPivot: number) {
		ctxMain.save();

		ctxMain.resetTransform();
		ctxMain.translate(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY));
		ctxMain.rotate(angle);

		ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		ctxMain.restore();
	}

	public static DrawImageWithAngleVFlipped(image: Sprite, rect: Rectangle, angle: number, xPivot: number, yPivot: number) {
		ctxMain.save();

		ctxMain.resetTransform();
		ctxMain.translate(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY));
		ctxMain.rotate(angle);
		ctxMain.scale(1, -1);

		ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		ctxMain.restore();
	}

	public static DrawVignette(color: Color, startAlpha?: number, endAlpha?: number) {
		const outerRadius = ctxMain.canvas.width * 1;
		const innerRadius = ctxMain.canvas.width * 0.1;
		const grd = ctxMain.createRadialGradient(ctxMain.canvas.width / 2, ctxMain.canvas.height / 2, innerRadius, ctxMain.canvas.width / 2, ctxMain.canvas.height / 2, outerRadius);
		grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha ?? 0.1})`);
		grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha ?? 0.6})`);

		ctxMain.fillStyle = grd;
		ctxMain.fillRect(0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
	}

	public static DrawRectangleWithGradient(rect: Rectangle, start: Color, end: Color) {
		const grd = ctxMain.createLinearGradient(
			// rect.X - levelPosition,
			rect.X,
			ctxMain.canvas.height - rect.Height - rect.Y,
			// rect.X - levelPosition + rect.Width,
			rect.X + rect.Width,
			ctxMain.canvas.height - rect.Height - rect.Y + rect.Height
		);

		grd.addColorStop(0, start.toString());
		grd.addColorStop(1, end.toString());

		ctxMain.fillStyle = grd;

		Canvas.DrawRectangle(rect.X - this.CameraX, rect.Y - this.CameraY, rect.Width, rect.Height);
	}

	public static DrawRectangleWithGradientAndAngle(rect: Rectangle, start: [number, Color], end: [number, Color], angle: number, xPivot: number, yPivot: number) {
		const grd = ctxMain.createLinearGradient(xPivot, yPivot - rect.Height, rect.Width, rect.Height);

		grd.addColorStop(start[0], start[1].toString());
		grd.addColorStop(end[0], end[1].toString());
		ctxMain.fillStyle = grd;

		Canvas.DrawRectangleWithAngle(rect.X, rect.Y, rect.Width, rect.Height, angle, xPivot, yPivot);
	}

	public static GetClientRectangle() {
		return ctxMain.canvas.getBoundingClientRect();
	}
}

export class GUI {
	static get Width() {
		return ctxMain.canvas.width;
	}
	static get Height() {
		return ctxMain.canvas.height;
	}

	public static SetFillColor(color: Color) {
		ctxMain.fillStyle = color.toString();

		fillStyle = color.toString();
	}

	public static SetStroke(color: Color, width: number) {
		ctxMain.strokeStyle = color.toString();
		ctxMain.lineWidth = width;

		strokeStyle = [color.toString(), width];
	}

	public static ClearFillColor() {
		fillStyle = null;
	}

	public static ClearStroke() {
		strokeStyle = null;
	}

	public static SetBaselineTop() {
		ctxMain.textBaseline = "top";
	}

	public static SetBaselineDefault() {
		ctxMain.textBaseline = "alphabetic";
	}

	public static Clear() {
		ctxMain.clearRect(0, 0, this.Width, GUI.Height);
	}

	public static SetFont(size: number) {
		ctxMain.font = `${size}px Consolas`; // Monospace
		ctxMain.letterSpacing = "2px";
	}

	public static DrawRectangleWithAngleAndStroke(x: number, y: number, width: number, height: number, angle: number, xPivot: number, yPivot: number) {
		const prev = ctxMain.getTransform();

		ctxMain.resetTransform();
		ctxMain.translate(x, y);
		ctxMain.rotate(angle);

		ctxMain.beginPath();
		ctxMain.rect(xPivot, yPivot - height, width, height);
		ctxMain.fill();
		ctxMain.stroke();

		ctxMain.setTransform(prev);
	}

	public static DrawRectangle(x: number, y: number, width: number, height: number) {
		ctxMain.beginPath();

		ctxMain.rect(x, y, width, height);

		if (fillStyle !== null) ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawRoundedRectangle(x: number, y: number, width: number, height: number, round: number | [number, number, number, number]) {
		ctxMain.beginPath();

		ctxMain.roundRect(x, y, width, height, round);

		if (fillStyle !== null) ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawCircle(x: number, y: number, radius: number) {
		ctxMain.beginPath();

		ctxMain.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);

		if (fillStyle !== null) ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawSector(x: number, y: number, radius: number, angle: number) {
		ctxMain.beginPath();

		ctxMain.moveTo(x, y);
		ctxMain.arc(x, y, radius, 0, angle);

		if (fillStyle !== null) ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawText(x: number, y: number, text: string) {
		ctxMain.fillText(text, x, y);
	}

	public static DrawTextWithBreakes(text: string, x: number, y: number) {
		const height = ctxMain.measureText("|").actualBoundingBoxAscent + ctxMain.measureText("|").actualBoundingBoxDescent;
		const lines = text.split("\n");

		for (let i = 0; i < lines.length; i++) ctxMain.fillText(lines[i], x, y + i * height);
	}

	public static DrawTextCenter(text: string, x: number, y: number, width: number, height?: number) {
		const textWidth = ctxMain.measureText(text).width;

		if (height !== undefined) {
			const textHeight = ctxMain.measureText(text).actualBoundingBoxAscent + ctxMain.measureText(text).actualBoundingBoxDescent;

			ctxMain.fillText(text, x + (width - textWidth) / 2, y + (height + textHeight) / 2);
		} else ctxMain.fillText(text, x + (width - textWidth) / 2, y);
	}

	public static DrawTextClamped(x: number, y: number, text: string, maxWidth: number) {
		const height = ctxMain.measureText(text).actualBoundingBoxAscent + ctxMain.measureText(text).actualBoundingBoxDescent;
		const lineCount = Math.floor(maxWidth / ctxMain.measureText("0").width);

		for (let i = 0; i < Math.ceil(text.length / lineCount); i++) ctxMain.fillText(text.slice(lineCount * i, lineCount * (i + 1)).toString(), x, y + i * height * 2);
	}

	public static DrawTextWrapped(x: number, y: number, text: string, maxWidth: number) {
		const height = ctxMain.measureText("0").actualBoundingBoxAscent + ctxMain.measureText("0").actualBoundingBoxDescent;
		const words = text.split(" ");
		const lines: string[] = [];
		let added = 0;

		for (let l = 0; l < 50; l++) {
			let lastSpace = maxWidth;

			for (let i = 0; i < 50; i++) {
				lastSpace -= ctxMain.measureText(words[added + i] + " ").width;

				if (lastSpace < 0 || words.length < added + i) {
					lines.push(words.slice(added, added + i).join(" "));
					added += i;
					break;
				}
			}

			ctxMain.fillText(lines[l], x, y + l * height * 2);
		}
	}

	public static DrawText2CenterLineBreaked(x: number, y: number, text: string) {
		const descent = ctxMain.measureText("").fontBoundingBoxAscent;
		const height = ctxMain.measureText("").fontBoundingBoxDescent + descent;
		const lines: string[] = text.split("\n");

		const lastAlign = ctxMain.textAlign;
		ctxMain.textAlign = "center";

		for (let l = 0; l < lines.length; l++) ctxMain.fillText(lines[l], x, y + height * (l - lines.length * 0.5) + descent);

		ctxMain.textAlign = lastAlign;
	}

	public static DrawTextCenterLineBreaked(x: number, y: number, lines: string[]) {
		const descent = ctxMain.measureText("").fontBoundingBoxAscent;
		const height = ctxMain.measureText("").fontBoundingBoxDescent + descent;

		const lastAlign = ctxMain.textAlign;
		ctxMain.textAlign = "center";

		for (let l = 0; l < lines.length; l++) ctxMain.fillText(lines[l], x, y + height * l + descent);

		ctxMain.textAlign = lastAlign;
	}

	public static DrawImage(image: Sprite, x: number, y: number, width: number, height: number) {
		ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, x, y, width, height);
	}

	public static DrawImageScaled(image: Sprite, x: number, y: number, width: number, height: number) {
		if (image.BoundingBox.Width > image.BoundingBox.Height) {
			const scaledHeight = image.BoundingBox.Height * (width / image.BoundingBox.Width);
			ctxMain.drawImage(image.Image, x, y + (height - scaledHeight) / 2, width, scaledHeight);
		} else {
			const scaledWidth = image.BoundingBox.Width * (height / image.BoundingBox.Height);
			ctxMain.drawImage(image.Image, x + (width - scaledWidth) / 2, y, scaledWidth, height);
		}
	}

	public static DrawImageWithAngle(image: Sprite, x: number, y: number, width: number, height: number, angle: number) {
		ctxMain.save();

		ctxMain.resetTransform();
		ctxMain.translate(x, y);
		ctxMain.rotate(angle);

		ctxMain.drawImage(image.Image, -width / 2, -height / 2, width, height);

		ctxMain.restore();
	}

	public static DrawCircleWithGradient(x: number, y: number, radius: number, startColor: Color, endColor: Color) {
		const grd = ctxMain.createRadialGradient(x, y, 0, x, y, radius);
		grd.addColorStop(0, startColor.toString());
		grd.addColorStop(1, endColor.toString());

		ctxMain.fillStyle = grd;
		ctxMain.beginPath();
		ctxMain.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
		ctxMain.fill();
		if (strokeStyle !== null) ctxMain.stroke();
	}

	public static DrawVignette(color: Color, startRadius: number, startAlpha: number, endAlpha?: number) {
		const grd = ctxMain.createRadialGradient(GUI.Width / 2, GUI.Height / 2, GUI.Width * startRadius, GUI.Width / 2, GUI.Height / 2, GUI.Width);
		grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha})`);
		grd.addColorStop(0.2, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);
		grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);

		ctxMain.fillStyle = grd;
		ctxMain.fillRect(0, 0, GUI.Width, GUI.Height);
	}

	public static GetTextSize(text: string, includeLineBrakes = true) {
		if (includeLineBrakes) {
			const height = ctxMain.measureText("").fontBoundingBoxDescent + ctxMain.measureText("").fontBoundingBoxAscent;
			const measures = text.split("\n").map((x) => ctxMain.measureText(x).width);

			return new Vector2(Math.max(...measures), height * measures.length);
		} else {
			const measure = ctxMain.measureText(text);

			return new Vector2(measure.width, measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent);
		}
	}

	public static DrawUnfocusScreen() {
		GUI.SetFillColor(Color.Black);
		GUI.ClearStroke();
		GUI.DrawRectangle(0, 0, GUI.Width, GUI.Height);

		GUI.SetFillColor(Color.Red);

		GUI.DrawRectangle(0, 0, 100, 5);
		GUI.DrawRectangle(0, 0, 5, 100);
		GUI.DrawRectangle(20, 20, 10, 10);
		GUI.DrawRectangle(GUI.Width - 100, 0, 100, 5);
		GUI.DrawRectangle(GUI.Width - 5, 0, 5, 100);
		GUI.DrawRectangle(GUI.Width - 20 - 10, 20, 10, 10);
		GUI.DrawRectangle(0, GUI.Height - 5, 100, 5);
		GUI.DrawRectangle(0, GUI.Height - 100, 5, 100);
		GUI.DrawRectangle(20, GUI.Height - 20 - 10, 10, 10);
		GUI.DrawRectangle(GUI.Width - 100, GUI.Height - 5, 100, 5);
		GUI.DrawRectangle(GUI.Width - 5, GUI.Height - 100, 5, 100);
		GUI.DrawRectangle(GUI.Width - 20 - 10, GUI.Height - 20 - 10, 10, 10);

		GUI.SetFont(24);
		GUI.DrawText2CenterLineBreaked(GUI.Width / 2, GUI.Height / 2, "НАЖМИТЕ ЧТОБЫ ПРОДОЛЖИТЬ");
	}
}
