import { Item } from "../Items/Item.js";
import { Canvas } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color, LoadImage, Rectangle } from "../../Utilites.js";
import { Container } from "./Containers.js";

export class Box extends Container {
	private static readonly _sprite = LoadImage("Images/Container.png");

	constructor(x: number, y: number, ...items: { Item: Item; Chance: number }[]) {
		super(50, 50, 3, 3);

		this._x = x;
		this._y = y;

		let added = 0;
		for (const item of items) {
			if (added >= 9) break;

			let nextCellX = Math.round(Math.random() * 2);
			let nextCellY = Math.round(Math.random() * 2);

			while (this._items[nextCellY][nextCellX] !== null) {
				nextCellX = Math.round(Math.random() * 2);
				nextCellY = Math.round(Math.random() * 2);
			}

			if (Math.random() <= item.Chance) {
				this._items[nextCellY][nextCellX] = item.Item;
				added++;
			}
		}
	}

	override Render(): void {
		Canvas.SetFillColor(new Color(0, 255, 0));
		Canvas.DrawImage(Box._sprite, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}
}
