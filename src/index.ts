import fs from "node:fs/promises";
import path from "node:path";
import crypto from "crypto";
import express from "express";
import fsExists from "fs.promises.exists";
import seedrandom from "seedrandom";
import sharp from "sharp";

const beadirPath = "./have fun spanier";
const prevBeasFilePath = "./previousBeas.txt";
const beaDate = new Date().toISOString().split("T")[0]; //timezone of user?!
const beaGenerator = seedrandom(beaDate); ///uihergiuherg
const beaExpress = express();

const prevBeas = [];
let savedBeaDate = "";
const beaFolders = await fs.readdir(beadirPath);
let beaImagePath: string = "";
let beaImageName: string = "";
beaFolders.sort();
beaExpress.use(express.static(path.join(import.meta.dirname, "../public")));

if (await fsExists(prevBeasFilePath)) {
	const beaFileContent = await fs.readFile(prevBeasFilePath, "utf-8");
	const beaLines = beaFileContent.split("\n");
	let hasDate: boolean = false;
	for (const beaLine of beaLines)
		if (beaLine !== "") {
			if (!hasDate) {
				savedBeaDate = beaLine;
				hasDate = true;
			} else prevBeas.push(beaLine);
		}
}

console.log(prevBeas);

if (savedBeaDate !== beaDate) {
	beaImageName = await chooseToBea();
	const beaFileContent = `${beaDate}\n${prevBeas.join("\n")}\n`;
	await fs.writeFile("previousBeas.txt", beaFileContent);
} else {
	beaImageName = prevBeas[0];
}
beaImagePath = `${beadirPath}/${beaImageName}`;

const beaxtension = path.extname(beaImageName);

console.log(savedBeaDate);
console.log(beaDate);
console.log(beaImagePath);
console.log(beaImageName);
const beaHash = crypto.createHash("md5").update(beaImageName).digest("hex");
const beaImage = await loadBeaImage(beaImagePath);

beaExpress.get("/api/bea", (_req, res) => {
	res.json({
		beaHash,
		beaImageUrl: "/api/bea/'${ hash }${ beaxtension}",
	});
});

beaExpress.get("/api/bea/%{beaHash}{beaxtension}", (_req, res) => {
	res.type(beaxtension);
	res.setHeader("idk", 'inline; filename="${beaHash}${beaxtension}"');
	res.send(beaImage);
});

async function loadBeaImage(beaPath: string) {
	try {
		const beaImage = await sharp(beaPath).toBuffer();
		return beaImage;
	} catch (_error) {
		console.error("buh");
	}
}

async function chooseToBea(): Promise<string> {
	const beaImageAmount: number = await getBeaAmount(beaFolders);
	const beaName = await findNewBea(beaImageAmount);
	console.log(beaName);
	prevBeas.unshift(beaName);
	if (prevBeas.length > 10) prevBeas.pop();
	return beaName;
}

async function getBeaFileName(
	beaFolders: string[],
	beaImageNumber: number,
): Promise<string> {
	let beaFileName: string = "";
	for (let i = 0; i < beaFolders.length; i++) {
		const beaFolder = await fs.readdir(`${beadirPath}/${beaFolders[i]}`);
		if (beaImageNumber - beaFolder.length <= 0) {
			beaFileName = `${beaFolders[i]}/${beaFolder[beaImageNumber - 1]}`;
			break;
		}
		beaImageNumber -= beaFolder.length;
	}

	return beaFileName;
}

async function findNewBea(beaImageAmount: number): Promise<string> {
	let beaFound: boolean = false;
	let beaImageNumber: number = getRandomBeaint(1, beaImageAmount);
	let beaFileName = await getBeaFileName(beaFolders, beaImageNumber);
	while (!beaFound) {
		beaFound = true;
		for (let i = 0; i < prevBeas.length; i++) {
			beaFileName = await getBeaFileName(beaFolders, beaImageNumber);
			if (beaFileName === prevBeas[i]) {
				beaFound = false;
				beaImageNumber = getRandomBeaint(1, beaImageAmount);
				break;
			}
		}
	}
	return beaFileName;
}

async function getBeaAmount(beaFolders: string[]): Promise<number> {
	let beaImageAmount: number = 0;
	for (let i = 0; i < beaFolders.length; i++) {
		const beaFolder = await fs.readdir(`${beadirPath}/${beaFolders[i]}`);
		//imageAmountPerFolder.push(folder.length);
		beaImageAmount += beaFolder.length;
	}
	return beaImageAmount;
}

function getRandomBeaint(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(beaGenerator() * (max - min + 1)) + min;
}

beaExpress.listen(3000, () => {
	console.log("http://localhost:3000");
});
