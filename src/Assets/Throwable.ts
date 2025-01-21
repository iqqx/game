import { GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Direction, Tag } from "../Enums.js";
import { FlyingThrowable } from "../GameObjects/FlyingThrowable.js";
import { Scene } from "../Scene.js";
import { Sprite, Sound, Vector2, Rectangle, Color } from "../Utilites.js";
import { Item } from "./Items/Item.js";

export class Throwable extends Item {
	public declare readonly Icon: Sprite;
	public readonly Sprite: Sprite;
	// private readonly _sounds: { readonly Fire: Sound; readonly Shell?: Sound; readonly EmptyFire: Sound; readonly Reload: Sound; readonly Impact: Sound; readonly Hit: Sound };
	public readonly Id: string;

	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _direction: Direction;

	private static readonly _throwables: Throwable[] = [];

	public static GetById(id: string) {
		const w = Throwable._throwables.find((x) => x.Id === id);

		if (w === undefined) {
			// console.error(`Кидательное с идентификатором '${id}' не зарегистрировано.`);

			return undefined;
		}

		return new Throwable(w.Id, { View: w.Sprite, Icon: w.Icon });
	}

	public static Register(rawJson: {
		Id: string;
		Sprites: {
			Icon: string;
			Main: string;
		};
	}) {
		Throwable._throwables.push(new Throwable(rawJson.Id, { Icon: GetSprite(rawJson.Sprites.Icon), View: GetSprite(rawJson.Sprites.Main) }));
	}

	constructor(id: string, images: { Icon: Sprite; View: Sprite }) {
		super(1);

		this.Id = id;
		this.Icon = images.Icon;
		this.Sprite = images.View;
	}

	public Update(dt: number, position: Vector2, angle: number) {
		this._position = new Vector2(position.X, position.Y);
		this._direction = angle < Math.PI * -0.5 || angle > Math.PI * 0.5 ? Direction.Left : Direction.Right;
		this._angle = angle;
	}

	public Render() {
		const gripOffset = new Vector2(-7 * this.Sprite.Scale, 10 * this.Sprite.Scale);

		if (this._direction === Direction.Left) {
			Canvas.DrawImageWithAngleVFlipped(
				this.Sprite,
				new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprite.ScaledSize.X, this.Sprite.ScaledSize.Y),
				this._angle,
				gripOffset.X,
				gripOffset.Y
			);
		} else {
			Canvas.DrawImageWithAngle(
				this.Sprite,
				new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprite.ScaledSize.X, this.Sprite.ScaledSize.Y),
				this._angle,
				gripOffset.X,
				gripOffset.Y
			);
		}
	}

	public Throw() {
		Scene.Current.Instantiate(new FlyingThrowable(this._position.X, this._position.Y, this._angle, this));
	}
}
