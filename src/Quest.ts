import { Item } from "./Assets/Items/Item.js";
import { EnemyType } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Character } from "./GameObjects/QuestGivers/Character.js";
import { Scene } from "./Scene.js";

export class Quest {
	public readonly Title: string;
	public readonly Giver: typeof Character | typeof Player;
	public readonly Tasks: Task[];

	constructor(Title: string, Giver: typeof Character | typeof Player, ...Tasks: Task[]) {
		this.Title = Title;
		this.Giver = Giver;
		this.Tasks = Tasks;
	}

	public OnKilled(type: EnemyType) {
		for (const task of this.Tasks) if (task instanceof KillTask && task.EnemyType === type) task.Count();
	}

	public IsCompleted() {
		return this.Tasks.every((x) => x.IsCompleted());
	}
}

abstract class Task {
	abstract IsCompleted(): boolean;
}

export class KillTask extends Task {
	public readonly EnemyType: EnemyType;
	private _last: number;

	constructor(enemyType: EnemyType, last: number) {
		super();

		this.EnemyType = enemyType;
		this._last = last;
	}

	public Count(): boolean {
		this._last--;

		return this._last <= 0;
	}

	public IsCompleted() {
		return this._last <= 0;
	}

	public override toString() {
		return `Убей ${this._last} ${EnemyType[this.EnemyType]}`;
	}
}

export class HasItemTask extends Task {
	public readonly NeededItems: readonly (typeof Item)[];

	constructor(...items: (typeof Item)[]) {
		super();

		this.NeededItems = items;
	}

	IsCompleted(): boolean {
		const playerItems = Scene.Current.Player.GetItems();

		var has = true;

		for (const item of this.NeededItems) {
			if (playerItems.some((x) => x instanceof item) === false) {
				has = false;
				break;
			}
		}

		return has;
	}

	public override toString() {
		return this.IsCompleted() ? "Возвращайся к Моршу" : `Получи ${this.NeededItems.join(", ")}`;
	}
}

export class PickupBackpackTask extends Task {
	IsCompleted(): boolean {
		return Scene.Current.Player.HasBackpack();
	}

	public override toString() {
		return this.IsCompleted() ? "Отдай рюкзак Моршу" : "Подбери рюкзак";
	}
}

export class TalkTask extends Task {
	private readonly _with: typeof Character;

	constructor(With: typeof Character) {
		super();

		this._with = With;
	}

	IsCompleted(): boolean {
		return this._with.IsTalked();
	}

	public override toString() {
		return this.IsCompleted() ? "Меня не должно быть видно" : "Поговори с Моршу";
	}
}
