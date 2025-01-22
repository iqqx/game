import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Scene } from "../../Scene.js";
import { GetMaxIdentityString } from "../../Utilites.js";
import { Item } from "./Item.js";
import { UseableItem } from "./UsableItem.js";
export class ItemRegistry {
    static _items = [];
    static GetById(id, amount = 1) {
        const i = ItemRegistry._items.find((x) => x.Id === id);
        if (i === undefined) {
            // console.error(`Предмет с идентификатором '${id}' не зарегистрирован.`);
            return undefined;
        }
        const ni = i.Clone();
        ni.Add(amount);
        return ni;
    }
    static Register(rawJson) {
        // export class Bread extends Item {
        // 	public readonly UseTime = 1500;
        // 	public readonly Icon: Sprite = GetSprite("Bread");
        // 	protected readonly _usingSound = GetSound("Eat");
        // 	static toString(): string {
        // 		return "Хлеб";
        // 	}
        // 	public Render(at: Vector2, angle: number): void {
        // 		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        // 		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
        // 			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
        // 		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
        // 	}
        // 	protected OnUsed() {
        // 		Scene.Player.Heal(15);
        // 	}
        // }
        if (rawJson.Icon === undefined)
            throw new Error(`Иконка [Icon] не определена (Ближайший ключ: [${GetMaxIdentityString("Icon", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`);
        // if (rawJson.Stack === undefined)
        // 	throw new Error(
        // 		`Размер стака [Stack] не определен (Ближайший ключ: [${GetMaxIdentityString("Stack", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`
        // 	);
        if (rawJson.AfterUse === undefined) {
            ItemRegistry._items.push(new Item(rawJson.Id, GetSprite(rawJson.Icon), rawJson.Stack, rawJson.IsBig));
        }
        else {
            if (rawJson.AfterUse.Action === undefined)
                throw new Error(`Действие (AfterUse.Action) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
            if (rawJson.AfterUse.Time === undefined)
                throw new Error(`Длительность действия (AfterUse.Time) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
            let use = undefined;
            switch (rawJson.AfterUse.Action.Type) {
                case "Heal": {
                    use = {
                        afterUse: () => {
                            Scene.Player.Heal(rawJson.AfterUse.Action.By);
                        },
                        time: rawJson.AfterUse.Time * 1000,
                        Sound: GetSound(rawJson.AfterUse.Sound),
                    };
                    break;
                }
                default: {
                    throw new Error(`Неизвестный тип действия ${rawJson.AfterUse.Action.Type} [Предмет: ${rawJson.Id}]`);
                }
            }
            ItemRegistry._items.push(new UseableItem(rawJson.Id, GetSprite(rawJson.Icon), rawJson.Stack, rawJson.IsBig, use.Sound, use.afterUse, use.time));
        }
    }
}
//# sourceMappingURL=ItemRegistry.js.map