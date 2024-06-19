import { Item } from "./Assets/Items/Item.js";
import { EnemyType } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Character } from "./GameObjects/QuestGivers/Character.js";
import { Scene } from "./Scene.js";
import { GetEnemyTypeName } from "./Utilites.js";

export class Quest {
	public readonly Title: string;
	public readonly Giver: Character | Player;
	public readonly Tasks: Task[] = [];
	private _stage = 1;

	constructor(Title: string, Giver: Character | Player) {
		this.Title = Title;
		this.Giver = Giver;
	}

	public Update() {
		for (const task of this.Tasks.slice(0, this._stage)) {
			if (task instanceof MoveTask || task instanceof FakeMoveTask) task.Check();
		}
	}

	public InventoryChanged() {
		for (const task of this.Tasks.slice(0, this._stage)) {
			if (task instanceof HasItemTask) task.Check();
		}
	}

	public OnKilled(type: EnemyType) {
		for (const task of this.Tasks) if (task instanceof KillTask && task.EnemyType === type) task.Count();
	}

	public IsCompleted() {
		return this.Tasks[this.Tasks.length - 1] instanceof PlaceholderTask ? this._stage > this.Tasks.length - 1 : this._stage > this.Tasks.length;
	}

	public GetTasks() {
		return this.Tasks.slice(0, this._stage);
	}

	public AddKillTask(enemyType: EnemyType, count: number, absolute = false, mask?: string) {
		this.Tasks.push(new KillTask(this, enemyType, count, absolute, () => this._stage++, mask));

		return this;
	}

	public AddMoveTask(to: number, location: string) {
		this.Tasks.push(new MoveTask(this, () => this._stage++, location, to));

		return this;
	}

	public AddFakeMoveTask(to: number, location: string, fakeTo: number) {
		this.Tasks.push(new FakeMoveTask(this, () => this._stage++, location, to, fakeTo));

		return this;
	}

	public AddPlaceholderTask(text: string) {
		if (this.Tasks.length === 0) this._stage++;

		this.Tasks.push(new PlaceholderTask(this, () => this._stage++, text));

		return this;
	}

	public AddHasItemsTask(mask: string, ...items: [typeof Item, number][]) {
		const currentTasks = this.Tasks.length + 1;
		this.Tasks.push(
			new HasItemTask(
				this,
				() => this._stage++,
				() => (this._stage = currentTasks),
				mask,
				items
			)
		);

		return this;
	}
}

class Task {
	protected readonly _quest: Quest;
	protected readonly _onComplete: () => void;
	protected _completed = false;

	constructor(quest: Quest, onComplete: () => void) {
		this._quest = quest;
		this._onComplete = onComplete;
	}

	Check() {
		return false;
	}
}

class KillTask extends Task {
	public readonly EnemyType: EnemyType;

	private _last: number;
	private _mask?: string;

	constructor(quest: Quest, enemyType: EnemyType, last: number, absolute: boolean, onComplete: () => void, mask?: string) {
		super(quest, onComplete);

		this.EnemyType = enemyType;
		this._last = last;

		this._mask = mask;
	}

	public Count(): boolean {
		this._last--;

		return this._last <= 0;
	}

	public Check() {
		return this._last <= 0;
	}

	public override toString() {
		return `Убей ${this._last} ${GetEnemyTypeName(this.EnemyType)}`;
	}
}

class PlaceholderTask extends Task {
	private readonly _text: string;

	constructor(quest: Quest, onComplete: () => void, placeholder: string) {
		super(quest, onComplete);

		this._text = placeholder;
	}

	Check(): boolean {
		return false;
	}

	public override toString() {
		return this._text;
	}
}

class MoveTask extends Task {
	private readonly _name: string;
	private readonly _to: number;

	constructor(quest: Quest, onComplete: () => void, locationName: string, to: number) {
		super(quest, onComplete);

		this._name = locationName;
		this._to = to;
	}

	Check(): boolean {
		if (this._completed) return true;

		if (Math.abs(Scene.Player.GetCenter().X - this._to) < 500) {
			this._completed = true;
			this._onComplete();

			return true;
		}
	}

	public override toString() {
		const player = Scene.Player.GetCenter().X;
		const distance = Math.abs(Math.round((player - this._to) * 0.1));

		return this.Check()
			? "Вы прибыли"
			: `${this._name}: ${distance > 1000 ? (distance / 1000).toFixed(1) : distance} ${distance > 1000 ? "кило" : ""}метров в${player - this._to > 0 ? "лево" : "право"}`;
	}
}

class FakeMoveTask extends Task {
	private readonly _name: string;
	private readonly _to: number;
	private readonly _fakeTo: number;

	constructor(quest: Quest, onComplete: () => void, locationName: string, to: number, fakeTo: number) {
		super(quest, onComplete);

		this._name = locationName;
		this._to = to;
		this._fakeTo = fakeTo;
	}

	Check(): boolean {
		if (this._completed) return true;

		if (Math.abs(Scene.Player.GetCenter().X - this._to) < 500) {
			this._completed = true;
			this._onComplete();

			return true;
		}

		return false;
	}

	public override toString() {
		const player = Scene.Player.GetCenter().X;
		const distance = Math.abs(Math.round((player - this._fakeTo) * 0.1));

		return this._completed
			? "Вы прибыли"
			: `${this._name}: ${distance > 1000 ? (distance / 1000).toFixed(1) : distance} ${distance > 1000 ? "кило" : ""}метров в${player - this._to > 0 ? "лево" : "право"}`;
	}
}

class HasItemTask extends Task {
	public readonly NeededItems: readonly [typeof Item, number][];
	private _mask: string;
	protected readonly _onFail: () => void;

	constructor(quest: Quest, onComplete: () => void, onFail: () => void, mask: string, items: [typeof Item, number][]) {
		super(quest, onComplete);

		this.NeededItems = items;
		this._mask = mask;
		this._onFail = onFail;
	}

	Check(): boolean {
		const m = new Map<string, number>();

		for (const pitem of Scene.Current.Player.GetItems())
			if (m.has(pitem.constructor.name)) m.set(pitem.constructor.name, m.get(pitem.constructor.name) + 1);
			else m.set(pitem.constructor.name, 1);

		for (const item of this.NeededItems)
			if (m.get(item[0].name) === undefined || m.get(item[0].name) < item[1]) {
				if (this._completed === true) this._onFail();
				this._completed = false;

				return false;
			}

		if (this._completed === false) this._onComplete();
		this._completed = true;

		return true;
	}

	public override toString() {
		return this._mask;
	}
}
