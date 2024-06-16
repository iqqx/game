import { Backpack } from "./Assets/Containers/Backpack.js";
import { AidKit, Bread, Radio, Sausage, Vodka } from "./Assets/Items/Item.js";
import { AK } from "./Assets/Weapons/AK.js";
import { EnemyType } from "./Enums.js";
import { Box } from "./Assets/Containers/Box.js";
import { Human } from "./GameObjects/Enemies/Human.js";
import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Morshu } from "./GameObjects/QuestGivers/Morshu.js";
import { Spikes } from "./GameObjects/Spikes.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
import { IsImagesLoaded, LoadImage, LoadSound } from "./Utilites.js";
import { Glock } from "./Assets/Weapons/Glock.js";
import { Ladder } from "./GameObjects/Ladder.js";
import { AudioSource as BoomBox } from "./GameObjects/BoomBox.js";

const scene = new Scene(LoadImage("Images/Level_1.png"));

scene.Instantiate(new Wall(-28, 69, 1528, 194));
scene.Instantiate(new Wall(-29, 243, 253, 26));
scene.Instantiate(new Wall(-27, 232, 232, 54));
scene.Instantiate(new Wall(-33, 214, 215, 166));
scene.Instantiate(new Wall(-72, 317, 241, 75));
scene.Instantiate(new Wall(-98, 349, 244, 141));
scene.Instantiate(new Wall(-28, 355, 161, 147));
scene.Instantiate(new Wall(-12, 425, 120, 183));
scene.Instantiate(new Wall(-3, 587, 74, 149));
scene.Instantiate(new Wall(-14, 563, 98, 56));
scene.Instantiate(new Wall(-30, 714, 1535, 25));
scene.Instantiate(new Wall(1458, 52, 12043, 98));
scene.Instantiate(new Wall(13351, 145, 36, 118));
scene.Instantiate(new Wall(13315, 145, 45, 79));
scene.Instantiate(new Wall(1499, 639, 16127, 99));
scene.Instantiate(new Wall(13875, 38, 4145, 112));
scene.Instantiate(new Platform(13577, 137, 110, 13));
scene.Instantiate(new Platform(13765, 138, 70, 11));
scene.Instantiate(new Platform(3078, 212, 51, 11));
scene.Instantiate(new Platform(3078, 286, 48, 12));
scene.Instantiate(new Platform(3077, 362, 49, 13));
scene.Instantiate(new Platform(3190, 196, 44, 5));
scene.Instantiate(new Platform(3124, 366, 1321, 8));
scene.Instantiate(new Platform(4510, 369, 1285, 5));
scene.Instantiate(new Platform(5858, 365, 1288, 9));
scene.Instantiate(new Platform(7209, 365, 1286, 9));
scene.Instantiate(new Wall(9227, 133, 335, 92));
scene.Instantiate(new Wall(9544, 136, 55, 53));
scene.Instantiate(new Wall(9302, 216, 220, 47));
scene.Instantiate(new Wall(11551, 149, 1009, 39));
scene.Instantiate(new Wall(11701, 184, 784, 41));
scene.Instantiate(new Wall(11853, 218, 105, 44));
scene.Instantiate(new Wall(12115, 223, 293, 40));
scene.Instantiate(new Wall(12227, 250, 181, 49));
scene.Instantiate(new Wall(11288, 261, 223, 115));
scene.Instantiate(new Wall(11583, 281, 47, 138));
scene.Instantiate(new Wall(11505, 302, 103, 172));
scene.Instantiate(new Wall(11658, 339, 153, 149));
scene.Instantiate(new Wall(11732, 319, 48, 39));
scene.Instantiate(new Wall(11811, 376, 374, 127));
scene.Instantiate(new Wall(12013, 319, 53, 77));
scene.Instantiate(new Wall(12236, 393, 51, 59));
scene.Instantiate(new Wall(12173, 415, 87, 148));
scene.Instantiate(new Wall(12059, 485, 127, 161));
scene.Instantiate(new Wall(12174, 557, 50, 44));
scene.Instantiate(new Wall(11327, 366, 198, 47));
scene.Instantiate(new Wall(11363, 407, 138, 43));
scene.Instantiate(new Wall(11439, 442, 83, 46));
scene.Instantiate(new Wall(11477, 479, 68, 46));
scene.Instantiate(new Wall(11514, 514, 70, 49));
scene.Instantiate(new Wall(11552, 554, 96, 46));
scene.Instantiate(new Wall(11628, 592, 133, 61));
scene.Instantiate(new Wall(11318, 244, 165, 48));
scene.Instantiate(new Wall(11580, 301, 80, 122));
scene.Instantiate(new Wall(12259, 413, 40, 38));
scene.Instantiate(new Platform(1498, 248, 114, 14));
scene.Instantiate(new Platform(1129, 326, 108, 10));
scene.Instantiate(new Platform(1240, 362, 31, 10));
scene.Instantiate(new Platform(1338, 287, 27, 5));
scene.Instantiate(new Platform(1409, 292, 34, 6));
scene.Instantiate(new Platform(1568, 188, 82, 5));
scene.Instantiate(new Platform(267, 330, 31, 6));
scene.Instantiate(new Platform(307, 294, 27, 3));
scene.Instantiate(new Platform(489, 276, 35, 3));
scene.Instantiate(new Wall(12001, 338, 72, 44));
scene.Instantiate(new Ladder(500, 260, 300));
scene.Instantiate(new Spikes(13504, 5, 368, 14));
scene.Instantiate(new Human(2200, 300, EnemyType.Green));
scene.Instantiate(new Human(500, 300, EnemyType.Green));
scene.Instantiate(new Morshu(700, 260));
scene.Instantiate(new Backpack(600, 260, new Glock()));
scene.Instantiate(
	new Box(
		400,
		260,
		{ item: new Bread(), Chance: 0.9 },
		{ item: new Bread(), Chance: 0.5 },
		{ item: new Vodka(), Chance: 1 },
		{ item: new AidKit(), Chance: 0.2 },
		{ item: new AK(), Chance: 0.3 },
		{ item: new Sausage(), Chance: 0.6 },
		{ item: new Radio(), Chance: 1 }
	)
);
scene.Instantiate(
	new BoomBox(
		375,
		310,
		1000,
		LoadSound("Sounds/music.mp3"),
		LoadSound("Sounds/music-2.mp3"),
		LoadSound("Sounds/music-3.mp3"),
		LoadSound("https://emgregion.hostingradio.ru:8064/moscow.europaplus.mp3"),
		LoadSound("https://pool.anison.fm/AniSonFM(320)")
	)
);
scene.Instantiate(new Player(310, 500));

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);

	scene.Update(timeStamp);
	scene.Render();
	scene.RenderOverlay();
}

function loadLoop() {
	const n = window.requestAnimationFrame(loadLoop);

	if (!IsImagesLoaded()) return;

	window.cancelAnimationFrame(n);
	gameLoop(0);
}

loadLoop();
