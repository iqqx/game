import { Item } from "./Item.js";
export class UseableItem extends Item {
    _usingSound;
    UseTime;
    _isUsing;
    _usingTime = -1;
    _usingCallback;
    // public static Register(rawJson: {
    //     Id: string;
    //     Icon: string;
    //     Stack: number;
    //     AfterUse?: {
    //         Sound: string;
    //         Time: number;
    //         Animation: string;
    //         Action: {
    //             Type: "Heal";
    //             By: number;
    //         };
    //     };
    // }) {
    //     // export class Bread extends Item {
    //     // 	public readonly UseTime = 1500;
    //     // 	public readonly Icon: Sprite = GetSprite("Bread");
    //     // 	protected readonly _usingSound = GetSound("Eat");
    //     // 	static toString(): string {
    //     // 		return "Хлеб";
    //     // 	}
    //     // 	public Render(at: Vector2, angle: number): void {
    //     // 		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
    //     // 		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
    //     // 			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
    //     // 		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
    //     // 	}
    //     // 	protected OnUsed() {
    //     // 		Scene.Player.Heal(15);
    //     // 	}
    //     // }
    //     let use: { AfterUse: () => void; Time: number } = undefined;
    //     if (rawJson.AfterUse !== undefined) {
    //         if (rawJson.AfterUse.Action === undefined) throw new Error(`Действие (AfterUse.Action) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
    //         if (rawJson.AfterUse.Time === undefined) throw new Error(`Длительность действия (AfterUse.Time) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
    //         use.Time = rawJson.AfterUse.Time * 1000;
    //         switch (rawJson.AfterUse.Action.Type) {
    //             case "Heal": {
    //                 use.AfterUse = () => {
    //                     Scene.Player.Heal(rawJson.AfterUse.Action.By);
    //                 };
    //                 break;
    //             }
    //             default: {
    //                 throw new Error(`Неизвестный тип действия ${rawJson.AfterUse.Action.Type} [Предмет: ${rawJson.Id}]`);
    //             }
    //         }
    //     }
    //     Item._items.push(new Item(rawJson.Id, GetSprite(rawJson.Icon), rawJson.Stack, use));
    // }
    constructor(id, icon, stack, isBig, useSound, afterUse, time) {
        super(id, icon, stack, isBig);
        this.UseTime = time;
        this.AfterUse = afterUse;
        this._usingSound = useSound;
    }
    Is(other) {
        return this.Id === other.Id;
    }
    Clone() {
        return new UseableItem(this.Id, this.Icon, this.MaxStack, this.IsBig, this._usingSound, this.AfterUse, this.UseTime);
    }
    Update(dt, position, angle, direction) {
        super.Update(dt, position, angle, direction);
        if (this._usingTime >= 0) {
            this._usingTime += dt;
            if (this._usingTime >= this.UseTime) {
                this._usingTime = -1;
                this._usingCallback();
                this.AfterUse();
            }
        }
    }
    Use(callback) {
        // if (this.UseTime === undefined) return;
        if (this._isUsing)
            return;
        this._isUsing = true;
        this._usingSound?.Play();
        this._usingCallback = callback;
        this._usingTime = 0;
    }
    IsUsing() {
        return this._isUsing;
    }
    GetCount() {
        return this._count;
    }
    Take(count) {
        this._count = Math.clamp(this._count - count, 0, this.MaxStack);
    }
    Add(count) {
        count = Math.abs(count);
        const toAdd = Math.min(count, this.MaxStack - this._count);
        this._count += toAdd;
        return toAdd;
    }
    AfterUse() { }
}
//# sourceMappingURL=UsableItem.js.map