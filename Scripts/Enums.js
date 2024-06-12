export var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Rat"] = 0] = "Rat";
    EnemyType[EnemyType["Yellow"] = 1] = "Yellow";
    EnemyType[EnemyType["Red"] = 2] = "Red";
    EnemyType[EnemyType["Green"] = 3] = "Green";
})(EnemyType || (EnemyType = {}));
export var Tag;
(function (Tag) {
    Tag[Tag["Player"] = 1] = "Player";
    Tag[Tag["Enemy"] = 2] = "Enemy";
    Tag[Tag["Platform"] = 4] = "Platform";
    Tag[Tag["Wall"] = 8] = "Wall";
    Tag[Tag["NPC"] = 16] = "NPC";
    Tag[Tag["Pickable"] = 32] = "Pickable";
})(Tag || (Tag = {}));
