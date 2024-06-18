/* eslint-disable @typescript-eslint/no-namespace */
import { Vector2 } from "./Utilites.js";
const ctxMain = document.getElementById("main-canvas").getContext("2d");
ctxMain.imageSmoothingEnabled = false;
const ctxOverlay = document.createElement("canvas").getContext("2d");
ctxOverlay.canvas.className = "123";
// ctxOverlay.canvas.width = ctxMain.canvas.clientWidth;
// ctxOverlay.canvas.height = ctxMain.canvas.clientHeight;
ctxOverlay.canvas.width = ctxMain.canvas.width;
ctxOverlay.canvas.height = ctxMain.canvas.height;
ctxOverlay.imageSmoothingEnabled = false;
let ctx = ctxMain;
let fillStyle;
let strokeStyle;
export var Canvas;
(function (Canvas) {
    function SwitchOn() {
        ctxMain.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
        ctx = ctxMain;
    }
    Canvas.SwitchOn = SwitchOn;
    function EraseRectangle(x, y, width, height) {
        ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
    }
    Canvas.EraseRectangle = EraseRectangle;
    function SetFillColor(color) {
        ctx.fillStyle = color.toString();
        fillStyle = color.toString();
    }
    Canvas.SetFillColor = SetFillColor;
    function ClearFillColor() {
        fillStyle = null;
    }
    Canvas.ClearFillColor = ClearFillColor;
    function ClearStroke() {
        strokeStyle = null;
    }
    Canvas.ClearStroke = ClearStroke;
    function SetStroke(color, width) {
        ctx.strokeStyle = color.toString();
        ctx.lineWidth = width;
        strokeStyle = [color.toString(), width];
    }
    Canvas.SetStroke = SetStroke;
    function SetFillRadialGradient(rect, start, end) {
        const grd = ctx.createRadialGradient(rect.X + rect.Width / 2, ctx.canvas.height - rect.Height * 0.5 - rect.Y, 0, rect.X + rect.Width / 2, ctx.canvas.height - rect.Height * 0.5 - rect.Y, Math.max(rect.Width, rect.Height) * 2);
        grd.addColorStop(0, start.toString());
        grd.addColorStop(1, end.toString());
        ctx.fillStyle = grd;
    }
    Canvas.SetFillRadialGradient = SetFillRadialGradient;
    function ResetTransform() {
        ctx.resetTransform();
    }
    Canvas.ResetTransform = ResetTransform;
    function Translate(x, y) {
        ctx.translate(x, y);
    }
    Canvas.Translate = Translate;
    function ClearRectangle(x, y, width, height) {
        ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
    }
    Canvas.ClearRectangle = ClearRectangle;
    function DrawRectangle(x, y, width, height) {
        ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
    }
    Canvas.DrawRectangle = DrawRectangle;
    function DrawRectangleEx(rect) {
        ctx.beginPath();
        ctx.rect(rect.X, ctx.canvas.height - rect.Y, rect.Width, -rect.Height);
        if (fillStyle !== null)
            ctx.fill();
        if (strokeStyle !== null)
            ctx.stroke();
    }
    Canvas.DrawRectangleEx = DrawRectangleEx;
    function DrawRectangleRounded(rect, round) {
        ctx.beginPath();
        ctx.roundRect(rect.X, ctx.canvas.height - rect.Y, rect.Width, -rect.Height, round);
        ctx.fill();
    }
    Canvas.DrawRectangleRounded = DrawRectangleRounded;
    function DrawImage(image, rect) {
        ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, rect.X, ctx.canvas.height - rect.Height - rect.Y, rect.Width, rect.Height);
    }
    Canvas.DrawImage = DrawImage;
    function DrawBackground(image, offset) {
        const ratio = image.Image.naturalHeight / ctx.canvas.height;
        ctx.drawImage(image.Image, Math.round(offset * ratio), 0, Math.round(ctx.canvas.width * ratio), image.Image.naturalHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    Canvas.DrawBackground = DrawBackground;
    function GetSize() {
        return new Vector2(ctx.canvas.width, ctx.canvas.height);
    }
    Canvas.GetSize = GetSize;
    function DrawImageFlipped(image, rect) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, -rect.X - rect.Width, ctx.canvas.height - rect.Height - rect.Y, rect.Width, rect.Height);
        ctx.restore();
    }
    Canvas.DrawImageFlipped = DrawImageFlipped;
    function DrawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.ellipse(x, ctx.canvas.height - radius / 2 - y, radius, radius, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    Canvas.DrawCircle = DrawCircle;
    function DrawEllipse(x, y, radiusX, radiusY) {
        ctx.beginPath();
        ctx.ellipse(x, ctx.canvas.height - radiusY / 2 - y, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (fillStyle !== null)
            ctx.fill();
        if (strokeStyle !== null)
            ctx.stroke();
    }
    Canvas.DrawEllipse = DrawEllipse;
    function DrawRectangleWithAngle(x, y, width, height, angle, xPivot, yPivot) {
        const prev = ctx.getTransform();
        ctx.resetTransform();
        ctx.translate(x, ctx.canvas.height - y);
        ctx.rotate(angle);
        ctx.fillRect(xPivot, yPivot - height, width, height);
        ctx.setTransform(prev);
    }
    Canvas.DrawRectangleWithAngle = DrawRectangleWithAngle;
    function DrawRectangleWithAngleAndStroke(x, y, width, height, angle, xPivot, yPivot) {
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
    Canvas.DrawRectangleWithAngleAndStroke = DrawRectangleWithAngleAndStroke;
    function DrawImageWithAngle(image, rect, angle, xPivot, yPivot) {
        ctx.save();
        ctx.resetTransform();
        // ctx.translate(rect.X - levelPosition, ctx.canvas.height - rect.Y);
        ctx.translate(rect.X, ctx.canvas.height - rect.Y);
        ctx.rotate(angle);
        // ctx.drawImage(image.Image, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        ctx.restore();
    }
    Canvas.DrawImageWithAngle = DrawImageWithAngle;
    function DrawImageWithAngleVFlipped(image, rect, angle, xPivot, yPivot) {
        ctx.save();
        ctx.resetTransform();
        ctx.translate(rect.X, ctx.canvas.height - rect.Y);
        ctx.rotate(angle);
        ctx.scale(1, -1);
        ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        ctx.restore();
    }
    Canvas.DrawImageWithAngleVFlipped = DrawImageWithAngleVFlipped;
    function DrawVignette(color, startAlpha, endAlpha) {
        const outerRadius = ctx.canvas.width * 1;
        const innerRadius = ctx.canvas.width * 0.1;
        const grd = ctx.createRadialGradient(ctx.canvas.width / 2, ctx.canvas.height / 2, innerRadius, ctx.canvas.width / 2, ctx.canvas.height / 2, outerRadius);
        grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha ?? 0.1})`);
        grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha ?? 0.6})`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    Canvas.DrawVignette = DrawVignette;
    function DrawRectangleWithGradient(rect, start, end) {
        const grd = ctx.createLinearGradient(
        // rect.X - levelPosition,
        rect.X, ctx.canvas.height - rect.Height - rect.Y, 
        // rect.X - levelPosition + rect.Width,
        rect.X + rect.Width, ctx.canvas.height - rect.Height - rect.Y + rect.Height);
        grd.addColorStop(0, start.toString());
        grd.addColorStop(1, end.toString());
        ctx.fillStyle = grd;
        DrawRectangle(rect.X, rect.Y, rect.Width, rect.Height);
    }
    Canvas.DrawRectangleWithGradient = DrawRectangleWithGradient;
    function DrawRectangleWithGradientAndAngle(rect, start, end, angle, xPivot, yPivot) {
        const grd = ctx.createLinearGradient(xPivot, yPivot - rect.Height, rect.Width, rect.Height);
        grd.addColorStop(start[0], start[1].toString());
        grd.addColorStop(end[0], end[1].toString());
        ctx.fillStyle = grd;
        DrawRectangleWithAngle(rect.X, rect.Y, rect.Width, rect.Height, angle, xPivot, yPivot);
    }
    Canvas.DrawRectangleWithGradientAndAngle = DrawRectangleWithGradientAndAngle;
    function GetClientRectangle() {
        return ctx.canvas.getBoundingClientRect();
    }
    Canvas.GetClientRectangle = GetClientRectangle;
})(Canvas || (Canvas = {}));
export var GUI;
(function (GUI) {
    GUI.Width = ctxOverlay.canvas.width;
    GUI.Height = ctxOverlay.canvas.height;
    function SwitchOn() {
        ctx = ctxOverlay;
    }
    GUI.SwitchOn = SwitchOn;
    function SetFillColor(color) {
        ctx.fillStyle = color.toString();
        fillStyle = color.toString();
    }
    GUI.SetFillColor = SetFillColor;
    function SetStroke(color, width) {
        ctx.strokeStyle = color.toString();
        ctx.lineWidth = width;
        strokeStyle = [color.toString(), width];
    }
    GUI.SetStroke = SetStroke;
    function ClearFillColor() {
        fillStyle = null;
    }
    GUI.ClearFillColor = ClearFillColor;
    function ClearStroke() {
        strokeStyle = null;
    }
    GUI.ClearStroke = ClearStroke;
    function Clear() {
        ctx.clearRect(0, 0, GUI.Width, GUI.Height);
    }
    GUI.Clear = Clear;
    function SetFont(size) {
        ctx.font = `${size}px Consolas`; // Monospace
        ctx.letterSpacing = "2px";
    }
    GUI.SetFont = SetFont;
    function DrawRectangle(x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        if (fillStyle !== null)
            ctx.fill();
        if (strokeStyle !== null)
            ctx.stroke();
    }
    GUI.DrawRectangle = DrawRectangle;
    function DrawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
        if (fillStyle !== null)
            ctx.fill();
        if (strokeStyle !== null)
            ctx.stroke();
    }
    GUI.DrawCircle = DrawCircle;
    function DrawText(x, y, text) {
        ctx.fillText(text, x, y);
    }
    GUI.DrawText = DrawText;
    function DrawTextWithBreakes(text, x, y) {
        const height = ctx.measureText("|").actualBoundingBoxAscent + ctx.measureText("|").actualBoundingBoxDescent;
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++)
            ctx.fillText(lines[i], x, y + i * height);
    }
    GUI.DrawTextWithBreakes = DrawTextWithBreakes;
    function DrawTextCenter(text, x, y, width, height) {
        const textWidth = ctx.measureText(text).width;
        if (height !== undefined) {
            const textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
            ctx.fillText(text, x + (width - textWidth) / 2, y + (height + textHeight) / 2);
        }
        else
            ctx.fillText(text, x + (width - textWidth) / 2, y);
    }
    GUI.DrawTextCenter = DrawTextCenter;
    function DrawTextClamped(x, y, text, maxWidth) {
        const height = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
        const lineCount = Math.floor(maxWidth / ctx.measureText("0").width);
        for (let i = 0; i < Math.ceil(text.length / lineCount); i++)
            ctx.fillText(text.slice(lineCount * i, lineCount * (i + 1)).toString(), x, y + i * height * 2);
    }
    GUI.DrawTextClamped = DrawTextClamped;
    function DrawTextWrapped(x, y, text, maxWidth) {
        const height = ctx.measureText("0").actualBoundingBoxAscent + ctx.measureText("0").actualBoundingBoxDescent;
        const words = text.split(" ");
        const lines = [];
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
    }
    GUI.DrawTextWrapped = DrawTextWrapped;
    function DrawImage(image, x, y, width, height) {
        ctx.drawImage(image.Image, image.BoundingBox.X, image.BoundingBox.Y, image.BoundingBox.Width, image.BoundingBox.Height, x, y, width, height);
    }
    GUI.DrawImage = DrawImage;
    function DrawImageWithAngle(image, x, y, width, height, angle) {
        ctx.save();
        ctx.resetTransform();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.drawImage(image.Image, -width / 2, -height / 2, width, height);
        ctx.restore();
    }
    GUI.DrawImageWithAngle = DrawImageWithAngle;
    function DrawCircleWithGradient(x, y, radius, startColor, endColor) {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, startColor.toString());
        grd.addColorStop(1, endColor.toString());
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
        ctx.fill();
        if (strokeStyle !== null)
            ctx.stroke();
    }
    GUI.DrawCircleWithGradient = DrawCircleWithGradient;
    function DrawVignette(color, startRadius, startAlpha, endAlpha) {
        const grd = ctx.createRadialGradient(GUI.Width / 2, GUI.Height / 2, GUI.Width * startRadius, GUI.Width / 2, GUI.Height / 2, GUI.Width);
        grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, ${startAlpha})`);
        grd.addColorStop(0.2, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);
        grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, ${endAlpha})`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, GUI.Width, GUI.Height);
    }
    GUI.DrawVignette = DrawVignette;
})(GUI || (GUI = {}));
