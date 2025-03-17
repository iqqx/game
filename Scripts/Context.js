import { Color, IsMobile, Vector2 } from "./Utilites.js";
const ctxMain = document.getElementById("main-canvas").getContext("2d");
ctxMain.canvas.width = window.innerWidth;
ctxMain.canvas.height = window.innerHeight;
ctxMain.imageSmoothingEnabled = false;
window.addEventListener("resize", () => {
    ctxMain.canvas.width = window.innerWidth;
    ctxMain.canvas.height = window.innerHeight;
    ctxMain.imageSmoothingEnabled = false;
});
let fillStyle;
let strokeStyle;
export class Canvas {
    static get Width() {
        return ctxMain.canvas.width;
    }
    static get Height() {
        return ctxMain.canvas.height;
    }
    static CameraX = 0;
    static CameraY = 0;
    static HTML = ctxMain.canvas;
    static ToFullscreen() {
        ctxMain.canvas.requestFullscreen();
    }
    static IsFullscreen() {
        return document.fullscreenElement !== null && (IsMobile() || (Math.abs(window.outerWidth - ctxMain.canvas.width) < 20 && Math.abs(window.outerHeight - ctxMain.canvas.height) < 20));
    }
    static LockMouse() {
        ctxMain.canvas.requestPointerLock();
    }
    static SetFillColor(color) {
        ctxMain.fillStyle = color.toString();
        fillStyle = color.toString();
    }
    static ClearFillColor() {
        fillStyle = null;
    }
    static ClearStroke() {
        strokeStyle = null;
    }
    static SetStroke(color, width) {
        ctxMain.strokeStyle = color.toString();
        ctxMain.lineWidth = width;
        strokeStyle = [color.toString(), width];
    }
    static SetFillRadialGradient(rect, start, end) {
        const grd = ctxMain.createRadialGradient(rect.X + rect.Width / 2, ctxMain.canvas.height - rect.Height * 0.5 - rect.Y, 0, rect.X + rect.Width / 2, ctxMain.canvas.height - rect.Height * 0.5 - rect.Y, Math.max(rect.Width, rect.Height) * 2);
        grd.addColorStop(0, start.toString());
        grd.addColorStop(1, end.toString());
        ctxMain.fillStyle = grd;
    }
    static DrawRectangle(x, y, width, height) {
        ctxMain.fillRect(x - this.CameraX, ctxMain.canvas.height - height - (y - this.CameraY), width, height);
    }
    static DrawRectangleEx(rect) {
        ctxMain.beginPath();
        ctxMain.rect(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY), rect.Width, -rect.Height);
        if (fillStyle !== null)
            ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawImage(image, rect) {
        if (rect.X < this.CameraX - this.Width || rect.X > this.CameraX + this.Width)
            return;
        ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, rect.X - this.CameraX, ctxMain.canvas.height - rect.Height - (rect.Y - this.CameraY), rect.Width, rect.Height);
    }
    static GetCameraScale() {
        return ctxMain.canvas.height / 750;
    }
    static DrawBackground(image) {
        // тут Y снизу
        // работает только для горизонтального разрешения
        const viewportScale = image.Image.naturalHeight / ctxMain.canvas.height;
        const standartScale = ctxMain.canvas.height / 750; // вся игра сделана для разрешения 750
        if (standartScale > 1)
            ctxMain.drawImage(image.Image, Math.round(this.CameraX * viewportScale * standartScale), 0, Math.round(ctxMain.canvas.width * standartScale * viewportScale), image.Image.naturalHeight, 0, Math.round((ctxMain.canvas.height - 750) * 0.5), ctxMain.canvas.width, 750);
        else
            ctxMain.drawImage(image.Image, Math.round(this.CameraX * viewportScale * standartScale), Math.round(image.Image.naturalHeight * (1 - standartScale) - this.CameraY * (viewportScale * standartScale)), Math.round(ctxMain.canvas.width * standartScale * viewportScale), Math.round(image.Image.naturalHeight * standartScale), 0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
    }
    static DrawImageFlipped(image, rect) {
        if (rect.X < this.CameraX - this.Width || rect.X > this.CameraX + this.Width)
            return;
        ctxMain.save();
        ctxMain.scale(-1, 1);
        ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, -(rect.X - this.CameraX) - rect.Width, ctxMain.canvas.height - rect.Height - (rect.Y - this.CameraY), rect.Width, rect.Height);
        ctxMain.restore();
    }
    static DrawCircle(x, y, radius) {
        ctxMain.beginPath();
        ctxMain.ellipse(x - this.CameraX, ctxMain.canvas.height - (y - this.CameraY), radius, radius, 0, 0, Math.PI * 2);
        ctxMain.fill();
    }
    static DrawRectangleWithAngle(x, y, width, height, angle, xPivot, yPivot) {
        const prev = ctxMain.getTransform();
        ctxMain.resetTransform();
        ctxMain.translate(x - this.CameraX, ctxMain.canvas.height - (y - this.CameraY));
        ctxMain.rotate(angle);
        ctxMain.fillRect(xPivot, yPivot - height, width, height);
        ctxMain.setTransform(prev);
    }
    static DrawImageWithAngle(image, rect, angle, xPivot, yPivot) {
        ctxMain.save();
        ctxMain.resetTransform();
        ctxMain.translate(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY));
        ctxMain.rotate(angle);
        ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        ctxMain.restore();
    }
    static DrawImageWithAngleVFlipped(image, rect, angle, xPivot, yPivot) {
        ctxMain.save();
        ctxMain.resetTransform();
        ctxMain.translate(rect.X - this.CameraX, ctxMain.canvas.height - (rect.Y - this.CameraY));
        ctxMain.rotate(angle);
        ctxMain.scale(1, -1);
        ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        ctxMain.restore();
    }
    static DrawVignette(color, startAlpha, endAlpha) {
        const outerRadius = ctxMain.canvas.width * 1;
        const innerRadius = ctxMain.canvas.width * 0.1;
        const grd = ctxMain.createRadialGradient(ctxMain.canvas.width / 2, ctxMain.canvas.height / 2, innerRadius, ctxMain.canvas.width / 2, ctxMain.canvas.height / 2, outerRadius);
        grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha ?? 0.1})`);
        grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha ?? 0.6})`);
        ctxMain.fillStyle = grd;
        ctxMain.fillRect(0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
    }
    static DrawRectangleWithGradient(rect, start, end) {
        const grd = ctxMain.createLinearGradient(
        // rect.X - levelPosition,
        rect.X, ctxMain.canvas.height - rect.Height - rect.Y, 
        // rect.X - levelPosition + rect.Width,
        rect.X + rect.Width, ctxMain.canvas.height - rect.Height - rect.Y + rect.Height);
        grd.addColorStop(0, start.toString());
        grd.addColorStop(1, end.toString());
        ctxMain.fillStyle = grd;
        Canvas.DrawRectangle(rect.X - this.CameraX, rect.Y - this.CameraY, rect.Width, rect.Height);
    }
    static DrawRectangleWithGradientAndAngle(rect, start, end, angle, xPivot, yPivot) {
        const grd = ctxMain.createLinearGradient(xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        grd.addColorStop(start[0], start[1].toString());
        grd.addColorStop(end[0], end[1].toString());
        ctxMain.fillStyle = grd;
        Canvas.DrawRectangleWithAngle(rect.X, rect.Y, rect.Width, rect.Height, angle, xPivot, yPivot);
    }
    static GetClientRectangle() {
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
    static SetFillColor(color) {
        ctxMain.fillStyle = color.toString();
        fillStyle = color.toString();
    }
    static SetStroke(color, width) {
        ctxMain.strokeStyle = color.toString();
        ctxMain.lineWidth = width;
        strokeStyle = [color.toString(), width];
    }
    static ClearFillColor() {
        fillStyle = null;
    }
    static ClearStroke() {
        strokeStyle = null;
    }
    static SetBaselineTop() {
        ctxMain.textBaseline = "top";
    }
    static SetBaselineDefault() {
        ctxMain.textBaseline = "alphabetic";
    }
    static Clear() {
        ctxMain.clearRect(0, 0, this.Width, GUI.Height);
    }
    static SetFont(size) {
        ctxMain.font = `${size}px Consolas`; // Monospace
        ctxMain.letterSpacing = "2px";
    }
    static DrawRectangleWithAngleAndStroke(x, y, width, height, angle, xPivot, yPivot) {
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
    static DrawRectangle(x, y, width, height) {
        ctxMain.beginPath();
        ctxMain.rect(x, y, width, height);
        if (fillStyle !== null)
            ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawRoundedRectangle(x, y, width, height, round) {
        ctxMain.beginPath();
        ctxMain.roundRect(x, y, width, height, round);
        if (fillStyle !== null)
            ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawCircle(x, y, radius) {
        ctxMain.beginPath();
        ctxMain.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
        if (fillStyle !== null)
            ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawSector(x, y, radius, angle) {
        ctxMain.beginPath();
        ctxMain.moveTo(x, y);
        ctxMain.arc(x, y, radius, 0, angle);
        if (fillStyle !== null)
            ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawText(x, y, text) {
        ctxMain.fillText(text, x, y);
    }
    static DrawTextWithBreakes(text, x, y) {
        const height = ctxMain.measureText("|").actualBoundingBoxAscent + ctxMain.measureText("|").actualBoundingBoxDescent;
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++)
            ctxMain.fillText(lines[i], x, y + i * height);
    }
    static DrawTextCenter(text, x, y, width, height) {
        const textWidth = ctxMain.measureText(text).width;
        if (height !== undefined) {
            const textHeight = ctxMain.measureText(text).actualBoundingBoxAscent + ctxMain.measureText(text).actualBoundingBoxDescent;
            ctxMain.fillText(text, x + (width - textWidth) / 2, y + (height + textHeight) / 2);
        }
        else
            ctxMain.fillText(text, x + (width - textWidth) / 2, y);
    }
    static DrawTextClamped(x, y, text, maxWidth) {
        const height = ctxMain.measureText(text).actualBoundingBoxAscent + ctxMain.measureText(text).actualBoundingBoxDescent;
        const lineCount = Math.floor(maxWidth / ctxMain.measureText("0").width);
        for (let i = 0; i < Math.ceil(text.length / lineCount); i++)
            ctxMain.fillText(text.slice(lineCount * i, lineCount * (i + 1)).toString(), x, y + i * height * 2);
    }
    static DrawTextWrapped(x, y, text, maxWidth) {
        const height = ctxMain.measureText("0").actualBoundingBoxAscent + ctxMain.measureText("0").actualBoundingBoxDescent;
        const words = text.split(" ");
        const lines = [];
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
    static DrawText2CenterLineBreaked(x, y, text) {
        const descent = ctxMain.measureText("").fontBoundingBoxAscent;
        const height = ctxMain.measureText("").fontBoundingBoxDescent + descent;
        const lines = text.split("\n");
        const lastAlign = ctxMain.textAlign;
        ctxMain.textAlign = "center";
        for (let l = 0; l < lines.length; l++)
            ctxMain.fillText(lines[l], x, y + height * (l - lines.length * 0.5) + descent);
        ctxMain.textAlign = lastAlign;
    }
    static DrawTextCenterLineBreaked(x, y, lines) {
        const descent = ctxMain.measureText("").fontBoundingBoxAscent;
        const height = ctxMain.measureText("").fontBoundingBoxDescent + descent;
        const lastAlign = ctxMain.textAlign;
        ctxMain.textAlign = "center";
        for (let l = 0; l < lines.length; l++)
            ctxMain.fillText(lines[l], x, y + height * l + descent);
        ctxMain.textAlign = lastAlign;
    }
    static DrawImage(image, x, y, width, height) {
        ctxMain.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, x, y, width, height);
    }
    static DrawImageScaled(image, x, y, width, height) {
        if (image.BoundingBox.Width > image.BoundingBox.Height) {
            const scaledHeight = image.BoundingBox.Height * (width / image.BoundingBox.Width);
            ctxMain.drawImage(image.Image, x, y + (height - scaledHeight) / 2, width, scaledHeight);
        }
        else {
            const scaledWidth = image.BoundingBox.Width * (height / image.BoundingBox.Height);
            ctxMain.drawImage(image.Image, x + (width - scaledWidth) / 2, y, scaledWidth, height);
        }
    }
    static DrawImageWithAngle(image, x, y, width, height, angle) {
        ctxMain.save();
        ctxMain.resetTransform();
        ctxMain.translate(x, y);
        ctxMain.rotate(angle);
        ctxMain.drawImage(image.Image, -width / 2, -height / 2, width, height);
        ctxMain.restore();
    }
    static DrawCircleWithGradient(x, y, radius, startColor, endColor) {
        const grd = ctxMain.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, startColor.toString());
        grd.addColorStop(1, endColor.toString());
        ctxMain.fillStyle = grd;
        ctxMain.beginPath();
        ctxMain.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
        ctxMain.fill();
        if (strokeStyle !== null)
            ctxMain.stroke();
    }
    static DrawVignette(color, startRadius, startAlpha, endAlpha) {
        const grd = ctxMain.createRadialGradient(GUI.Width / 2, GUI.Height / 2, GUI.Width * startRadius, GUI.Width / 2, GUI.Height / 2, GUI.Width);
        grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha})`);
        grd.addColorStop(0.2, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);
        grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);
        ctxMain.fillStyle = grd;
        ctxMain.fillRect(0, 0, GUI.Width, GUI.Height);
    }
    static GetTextSize(text, includeLineBrakes = true) {
        if (includeLineBrakes) {
            const height = ctxMain.measureText("").fontBoundingBoxDescent + ctxMain.measureText("").fontBoundingBoxAscent;
            const measures = text.split("\n").map((x) => ctxMain.measureText(x).width);
            return new Vector2(Math.max(...measures), height * measures.length);
        }
        else {
            const measure = ctxMain.measureText(text);
            return new Vector2(measure.width, measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent);
        }
    }
    static DrawUnfocusScreen() {
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
//# sourceMappingURL=Context.js.map