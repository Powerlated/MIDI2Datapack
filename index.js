const Midi = require("@tonejs/midi");

const path = require("path");

console.log("Welcome to MIDI2Datapack!");

const fs = require("fs");

// const midiData = fs.readFileSync("./Congratulations_Pewdiepie.mid");

//const midiData = fs.readFileSync("./National_Emblem_BagleySchissel.mid");

const midiData = fs.readFileSync("./National_Emblem_BagleySchissel.mid");
const midi = new Midi(midiData);

let packMcMeta = {
  pack: {
    pack_format: 4,
    description: "MIDI2Datapack"
  }
};

function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(entry) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
}

rimraf("./datapack");

fs.mkdirSync("./datapack");
fs.mkdirSync("./datapack/data");
fs.mkdirSync("./datapack/data/midi2datapack");
fs.mkdirSync("./datapack/data/midi2datapack/functions");
fs.writeFileSync("./datapack/pack.mcmeta", JSON.stringify(packMcMeta));

let tracks = midi.tracks;

let ppq = midi.header.ppq;
let bpm = Math.round(midi.header.tempos[0].bpm);

let gameTicksPerTick = (60000 / (bpm * ppq)) * 200;

let parsedTracks = new Array();

tracks.forEach((track, trackNumber) => {
  parsedTracks[trackNumber] = {};
  parsedTracks[trackNumber].notes = new Array();

  let instrumentName = track.instrument.name;

  track.notes.forEach((n, i) => {
    let gameTicks = Math.round(n.ticks / gameTicksPerTick);
    parsedTracks[trackNumber].notes[gameTicks] = new Array();
  });
  console.log(instrumentName);
  track.notes.forEach((n, i) => {
    let octave;
    let sound;
    if (instrumentName == "string ensemble 1" || instrumentName == "timpani") {
      sound = "minecraft:block.note_block.snare";
    } 
    if (instrumentName == "trombone") {
      sound = "minecraft:block.note_block.bass";
    } else if (instrumentName == "tuba") {
      sound = "minecraft:block.note_block.bass";
    } else if (instrumentName == "bassoon") {
      sound = "minecraft:block.note_block.bass";
    } else if (instrumentName == "tenor sax") {
      sound = "minecraft:block.note_block.bass";
    } else if (instrumentName == "bari sax") {
      sound = "minecraft:block.note_block.bass";
      octave = 1;
    }

    if (instrumentName == "french horn") {
      octave = 1;
      sound = "minecraft:block.note_block.harp"; 
    }

    if (instrumentName == "clarinet") {
      sound = "minecraft:block.note_block.harp";
    }

    let gameTicks = Math.round(n.ticks / gameTicksPerTick);
      parsedTracks[trackNumber].notes[gameTicks].push({
        pitch: n.pitch,
        velocity: n.velocity,
        sound: sound || "minecraft:block.note_block.pling",
        octave: octave || 2
      });
  });
});

// fs.writeFileSync(
//   "./datapack/data/midi2datapack/parsedTracks.json",
//   JSON.stringify(parsedTracks)
// );

const noteTable = {
  "F#1": 0.5,
  G1: 0.529732,
  "G#1": 0.561231,
  A1: 0.594604,
  "A#1": 0.629961,
  B1: 0.66742,
  C1: 0.707107,
  "C#1": 0.749154,
  D1: 0.793701,
  "D#1": 0.840896,
  E1: 0.890899,
  F1: 0.943874,

  "F#2": 1,
  G2: 1.059463,
  "G#2": 1.122462,
  A2: 1.189207,
  "A#2": 1.259921,
  B2: 1.33484,
  C2: 1.414214,
  "C#2": 1.498307,
  D2: 1.587401,
  "D#2": 1.681793,
  E2: 1.781797,
  F2: 1.887749,
  "F#3": 2
};

let finalIndex = new Array();
const dataRoot = "./datapack/data/midi2datapack/functions/";

parsedTracks.forEach((track, trackNumber) => {
  let filenamePrefix = `track${trackNumber}`;

  let trackIndexCmds = new Array();

  console.log(`parsing track`);

  track.notes.forEach((n, i) => {
    let filename = `${filenamePrefix}-tick${i.toString()}.mcfunction`;
    // console.log(`${dataRoot}${filename}`);

    n.forEach(l => {
      const appendFile = text => {
        fs.appendFileSync(`${dataRoot}${filename}`, `${text}`);
        //fs.appendFileSync(`${dataRoot}${filename}`, `say ${text}`);
      };

      appendFile(
        `execute at @a run playsound ${l.sound} record @a ~ ~ ~ ${
          l.velocity
        } ${noteTable[`${l.pitch}${l.octave}`]}\n`
      );

      appendFile(
        `tellraw @a "[${i}] execute at @a run playsound ${l.sound} record @a ~ ~ ~ ${
          l.velocity
        } ${noteTable[`${l.pitch}${l.octave}`]}"\n`
      );
    });

    /*\nsay execute at @a run playsound minecraft:block.note_block.bit neutral @a ~ ~ ~ 1 ${
        noteTable[`${n}2`]
      }*/

    trackIndexCmds.push(
      `schedule function midi2datapack:track${trackNumber}-tick${i.toString()} ${i.toString()}`
    );
  });

  fs.writeFileSync(
    `${dataRoot}${filenamePrefix}-index.mcfunction`,
    trackIndexCmds.join("\n")
  );

  finalIndex.push(`function midi2datapack:${filenamePrefix}-index`);
});

fs.writeFileSync(`${dataRoot}index.mcfunction`, finalIndex.join("\n"));
