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

beaExpress.get("/api/bea", (_req, res) => {
	res.json({ beaImagePath });
});

beaExpress.get("/api/bea/%{beaHash}{beaxtension}", (_req, res) => {
	//res.type(beaxtension);
	res.setHeader("idk", `inline; filename="${beaImagePath}${beaxtension}"`);
	res.send(beaImagePath);
});

async function getTheBea(): Promise<string> {
  await loadBeasInArray();
  let index: number = 0;
  let returnValue: string = "";
  if (allNewBeaFiles.length > 0) {
    index = getRandomBeaint(0, allNewBeaFiles.length - 1);
    returnValue = allNewBeaFiles[index].replace("new_", "")
    //await fs.rename(beadirPath + "/" + allNewBeaFiles[index], beadirPath + "/" + returnValue);              //THIS RENAMES THE FILE SO IT WONT BE NEW ANYMORE

  } else {
    let found: boolean = false;
    while (!found) {
      found = true;
      index = getRandomBeaint(0, allOldBeaFiles.length - 1);
      for (let i = 0; i < prevBeas.length; i++)
        if (allOldBeaFiles[index] == prevBeas[i]) {
          found = false;
          break;
        }
    }
    returnValue = allOldBeaFiles[index] + "";
  }
  return returnValue;
}

async function loadBeasInArray() {
  for (let i = 0; i < beaFolders.length; i++){
    const beaFolder = await fs.readdir(`${beadirPath}/${beaFolders[i]}`);
    for (let j = 0; j < beaFolder.length; j++){
      if (beaFolder[j].includes("new_"))
        allNewBeaFiles.push(beaFolders[i] + "/" +beaFolder[j]);
      allOldBeaFiles.push(beaFolders[i] + "/" +beaFolder[j]);
    }
  }
  console.log(allNewBeaFiles);
  console.log(allOldBeaFiles);
}

function getRandomBeaint(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(beaGenerator() * (max - min + 1)) + min;
}

beaExpress.listen(3000, () => {
	console.log("http://localhost:3000");
});
