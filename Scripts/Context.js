import { Vector2 } from "./Utilites.js";
const ctxMain = document.getElementById("main-canvas").getContext("2d");
ctxMain.imageSmoothingEnabled = false;
const ctxOverlay = document.createElement("canvas").getContext("2d");
// ctxOverlay.canvas.width = ctxMain.canvas.clientWidth;
// ctxOverlay.canvas.height = ctxMain.canvas.clientHeight;
ctxOverlay.canvas.width = ctxMain.canvas.width;
ctxOverlay.canvas.height = ctxMain.canvas.height;
ctxOverlay.imageSmoothingEnabled = false;
let ctx = ctxMain;
export var Canvas;
(function (Canvas) {
    function SwitchLayer(onMain = true) {
        if (onMain) {
            ctxMain.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, ctxMain.canvas.width, ctxMain.canvas.height);
            ctx = ctxMain;
        }
        else
            ctx = ctxOverlay;
    }
    Canvas.SwitchLayer = SwitchLayer;
    function EraseRectangle(x, y, width, height) {
        ctx.clearRect(x, ctx.canvas.height - y - height, width, height);
    }
    Canvas.EraseRectangle = EraseRectangle;
    function SetFillColor(color) {
        ctx.fillStyle = color.toString();
    }
    Canvas.SetFillColor = SetFillColor;
    function SetStroke(color, width) {
        ctx.strokeStyle = color.toString();
        ctx.lineWidth = width;
    }
    Canvas.SetStroke = SetStroke;
    function ResetTransform() {
        ctx.resetTransform();
    }
    Canvas.ResetTransform = ResetTransform;
    function Translate(x, y) {
        ctx.translate(x, y);
    }
    Canvas.Translate = Translate;
    function DrawRectangle(x, y, width, height) {
        ctx.fillRect(x, ctx.canvas.height - y - height, width, height);
    }
    Canvas.DrawRectangle = DrawRectangle;
    function DrawRectangleEx(rect) {
        ctx.beginPath();
        ctx.rect(rect.X, ctx.canvas.height - rect.Y - rect.Height, rect.Width, rect.Height);
        ctx.fill();
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
    function DrawImageProportional(image, rect) {
        const ratio = Math.min(rect.Height, rect.Width) / Math.max(image.naturalWidth, image.naturalHeight);
        const newHeight = image.naturalHeight * ratio;
        const offsetY = (rect.Height - newHeight) / 2;
        ctx.drawImage(image, rect.X, ctx.canvas.height - rect.Height - rect.Y + offsetY, rect.Width * ratio, newHeight);
    }
    Canvas.DrawImageProportional = DrawImageProportional;
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
    function DrawRectangleWithAngle(x, y, width, height, angle, xPivot, yPivot) {
        var prev = ctx.getTransform();
        ctx.resetTransform();
        ctx.translate(x, ctx.canvas.height - y);
        ctx.rotate(angle);
        ctx.fillRect(xPivot, yPivot - height, width, height);
        ctx.setTransform(prev);
    }
    Canvas.DrawRectangleWithAngle = DrawRectangleWithAngle;
    function DrawRectangleWithAngleAndStroke(x, y, width, height, angle, xPivot, yPivot) {
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
    Canvas.DrawRectangleWithAngleAndStroke = DrawRectangleWithAngleAndStroke;
    function DrawImageEx() { }
    Canvas.DrawImageEx = DrawImageEx;
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
    function DrawVignette(color) {
        var outerRadius = ctx.canvas.width * 0.6;
        var innerRadius = ctx.canvas.width * 0.5;
        var grd = ctx.createRadialGradient(ctx.canvas.width / 2, ctx.canvas.height / 2, innerRadius, ctx.canvas.width / 2, ctx.canvas.height / 2, outerRadius);
        grd.addColorStop(0, `rgba(${color.R}, ${color.G}, ${color.B}, .1)`);
        grd.addColorStop(1, `rgba(${color.R}, ${color.G}, ${color.B}, .6)`);
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
    function SetFont(size, family = "arial") {
        ctx.font = `${size}px ${family}`;
    }
    Canvas.SetFont = SetFont;
    function DrawText(x, y, text) {
        ctx.fillText(text, x, y);
    }
    Canvas.DrawText = DrawText;
    function DrawTextInRectangle(text, rect) {
        const height = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++)
            ctx.fillText(lines[i], rect.X, rect.Y + i * height);
    }
    Canvas.DrawTextInRectangle = DrawTextInRectangle;
})(Canvas || (Canvas = {}));
