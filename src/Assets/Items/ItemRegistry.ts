import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Scene } from "../../Scenes/Scene.js";
import { GetMaxIdentityString, Sound } from "../../Utilites.js";
import { Item } from "./Item.js";
import { UseableItem } from "./UseableItem.js";

export class ItemRegistry {
	private static readonly _items: Item[] = [];

	public static GetById(id: string, amount = 1) {
		const i = ItemRegistry._items.find((x) => x.Id === id);

		if (i === undefined) {
			// console.error(`Предмет с идентификатором '${id}' не зарегистрирован.`);

			return undefined;
		}

		const ni = i.Clone();

		ni.Add(amount);

		return ni;
	}

	public static Register(rawJson: {
		Id: string;
		Name: string;
		Icon: string;
		Stack?: string;
		IsBig?: boolean;
		AfterUse?: {
			Sound: string;
			Time: string;
			Animation: string;
			Action: {
				Type: "Heal";
				By: string;
			};
		};
	}) {
		if (rawJson.Icon === undefined)
			throw new Error(
				`Иконка [Icon] не определена (Ближайший ключ: [${GetMaxIdentityString("Icon", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`
			);
		if (rawJson.Name === undefined)
			throw new Error(
				`Название [Name] не определено (Ближайший ключ: [${GetMaxIdentityString("Name", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`
			);

		if (rawJson.AfterUse === undefined) {
			ItemRegistry._items.push(new Item(rawJson.Id, rawJson.Name, GetSprite(rawJson.Icon), parseInt(rawJson.Stack), rawJson.IsBig));
		} else {
			if (rawJson.AfterUse.Action === undefined) throw new Error(`Действие (AfterUse.Action) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
			if (rawJson.AfterUse.Time === undefined) throw new Error(`Длительность действия (AfterUse.Time) не определено\nat Parser: [Предмет: <${rawJson.Id}>].AfterUse`);
			let use: { afterUse: () => void; time: number; Sound: Sound } = undefined;

			switch (rawJson.AfterUse.Action.Type) {
				case "Heal": {
					use = {
						afterUse: () => {
							Scene.Current.Player.Heal(parseInt(rawJson.AfterUse.Action.By));
						},
						time: parseInt(rawJson.AfterUse.Time) * 1000,
						Sound: GetSound(rawJson.AfterUse.Sound),
					};

					break;
				}
				default: {
					throw new Error(`Неизвестный тип действия ${rawJson.AfterUse.Action.Type} [Предмет: ${rawJson.Id}]`);
				}
			}

			ItemRegistry._items.push(new UseableItem(rawJson.Id, rawJson.Name, GetSprite(rawJson.Icon), parseInt(rawJson.Stack), rawJson.IsBig, use.Sound, use.afterUse, use.time));
		}
	}
}
