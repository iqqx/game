import { GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Direction } from "../Enums.js";
import { FlyingThrowable } from "../GameObjects/FlyingThrowable.js";
import { Scene } from "../Scene.js";
import { Sprite, Vector2, Rectangle, IItem } from "../Utilites.js";

export class Throwable implements IItem {
	public readonly Id: string;
	public readonly Icon: Sprite;
	public readonly IsBig = false;
	public readonly MaxStack = 1;
	public readonly Sprite: Sprite;

	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _direction: Direction;

	private static readonly _throwables: Throwable[] = [];

	public static GetById(id: string) {
		const t = Throwable._throwables.find((x) => x.Id === id);

		if (t === undefined) {
			// console.error(`Кидательное с идентификатором '${id}' не зарегистрировано.`);

			return undefined;
		}

		return t.Clone();
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
		this.Id = id;
		this.Icon = images.Icon;
		this.Sprite = images.View;
	}

	GetCount(): number {
		return 1;
	}
	Take(count: number): void {
		throw new Error("Method not implemented.");
	}
	Add(count: number): number {
		throw new Error("Method not implemented.");
	}
	Is(item: IItem): item is IItem {
		return item.Id === this.Id;
	}

	public Clone(): Throwable {
		return new Throwable(this.Id, { View: this.Sprite, Icon: this.Icon });
	}

	public Update(dt: number, position: Vector2, angle: number, direction?: Direction) {
		this._position = position;
		this._direction = direction;
		this._angle = angle;
	}

	public Render() {
		const gripOffset = new Vector2(this.Sprite.ScaledSize.X * -0.5, this.Sprite.ScaledSize.Y * 0.5);

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
