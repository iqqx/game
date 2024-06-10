import { EnemyType } from "../../Enums.js";
import { KillTask, Quest } from "../../Quest.js";
import { GameObject } from "../../Utilites.js";
import { Morshu } from "./Morshu.js";

export class Character extends GameObject {
	protected _dialogLength = -1;
	protected _dialogState: number | null = 0;

	public Talk(): string {
		return "Янемой";
	}

	public Continue(): true | Quest {
		this._dialogState++;

		if (this._dialogState > this._dialogLength) {
			this._dialogState = null;
			return new Quest(
				"Убить боба",
				Morshu,
				new KillTask(EnemyType.Green, 1)
			);
		}

		return true;
	}
}
