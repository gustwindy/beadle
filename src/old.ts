//edge case? what if the generator pulls image with id on the 10th spot
// it gets pushed out but the program crashes, now it reloads and the seed puts in the new first timezone
// actually maybe nvm because date didnt change


import fs from 'fs/promises';
import fsExists from 'fs.promises.exists';
import seedrandom from 'seedrandom';
import crypto from 'crypto';
import sharp from 'sharp';
import express from 'express';
import path from "path";

const beadirPath = './have fun spanier';
const prevBeasFilePath = "./previousBeas.txt";
const beaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit', }).format(new Date());
const beaGenerator = seedrandom(beaDate);
const beaExpress = express();

let prevBeas:string[] = [];
let allOldBeaFiles: string[] = [];
let allNewBeaFiles: string[] = [];
let savedBeaDate = "";
let beaFolders = await fs.readdir(beadirPath);
let beaImagePath: string = "";
let beaImageName: string = "";
beaFolders.sort();

if (await fsExists(prevBeasFilePath)) {
	const beaFileContent = await fs.readFile(prevBeasFilePath, "utf-8");
	const beaLines = beaFileContent.split("\n");
	let hasDate: boolean = false;
	for (const beaLine of beaLines) {
		if (beaLine !== "") {
			if (!hasDate) {
				savedBeaDate = beaLine;
				hasDate = true;
			} else prevBeas.push(beaLine);
		}
	}
}

if (savedBeaDate !== beaDate) {
  beaImageName = await getTheBea();
  console.log(beaImageName);
	const beaFileContent = `${beaDate}\n${prevBeas.join("\n")}\n`;
	await fs.writeFile("previousBeas.txt", beaFileContent);
}
else beaImageName = prevBeas[0] + "";
beaImagePath = `${beadirPath}/${beaImageName}`;

const beaxtension = path.extname(beaImageName);

beaExpress.listen(3000, () => {
	console.log("http://localhost:3000");
});
