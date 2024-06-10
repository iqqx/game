import { EnemyType } from "./Enums.js";
export class Quest {
    Title;
    Giver;
    Tasks;
    constructor(Title, Giver, ...Tasks) {
        this.Title = Title;
        this.Giver = Giver;
        this.Tasks = Tasks;
    }
    OnKilled(type) {
        for (const task of this.Tasks)
            if (task instanceof KillTask && task.EnemyType === type)
                task.Count();
    }
}
class Task {
}
export class KillTask extends Task {
    EnemyType;
    _last;
    constructor(enemyType, last) {
        super();
        this.EnemyType = enemyType;
        this._last = last;
    }
    Count() {
        this._last--;
        return this._last <= 0;
    }
    IsCompleted() {
        return this._last <= 0;
    }
    toString() {
        return `Убей ${this._last} ${EnemyType[this.EnemyType]}`;
    }
}
