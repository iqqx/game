import { EnemyType } from "./Enums.js";
import { Character } from "./GameObjects/QuestGivers/Character.js";

export class Quest {
	public readonly Title: string;
	public readonly Giver: typeof Character;
	public readonly Tasks: Task[];

	constructor(Title: string, Giver: typeof Character, ...Tasks: Task[]) {
		this.Title = Title;
		this.Giver = Giver;
		this.Tasks = Tasks;
	}

	public OnKilled(type: EnemyType) {
		for (const task of this.Tasks)
			if (task instanceof KillTask && task.EnemyType === type)
				task.Count();
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
