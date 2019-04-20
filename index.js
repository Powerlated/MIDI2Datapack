const Midi = require("@tonejs/midi");

const path = require("path");

console.log("Welcome to MIDI2Datapack!");

const fs = require("fs");

const midiData = fs.readFileSync("./midi.mid");
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
fs.writeFileSync("./datapack/pack.mcmeta", JSON.stringify(packMcMeta));

let tracks = midi.tracks;

let ppq = midi.header.ppq;
let bpm = Math.round(midi.header.tempos[0].bpm);

let msPerTick = 60000 / (bpm * ppq);

let parsedTracks = new Array();

tracks.forEach((track, trackNumber) => {
  parsedTracks[trackNumber] = {};
  parsedTracks[trackNumber].notes = new Array();
  track.notes.forEach((n, i) => {
    let gameTicks = Math.round(n.ticks / 20);
    parsedTracks[trackNumber].notes[gameTicks] = n.pitch;
  });
});

fs.writeFileSync(
  "./datapack/data/midi2datapack/parsedTracks.json",
  JSON.stringify(parsedTracks)
);

const noteTable = {
  "F#1": 0.5,
  G1: 2 ^ (-10 / 12),
  "G#1": 2 ^ (-9 / 12),
  A1: 2 ^ (-8 / 12),
  B1: 2 ^ (-7 / 12),
  C1: 2 ^ (-6 / 12),
  "C#1": 2 ^ (-5 / 12),
  D1: 2 ^ (-4 / 12),
  "D#1": 2 ^ (-3 / 12),
  E1: 2 ^ (-2 / 12),
  F1: 2 ^ (-1 / 12),

  "F#2": 1,
  G2: 2 ^ (1 / 12),
  "G#2": 2 ^ (2 / 12),
  A2: 2 ^ (3 / 12),
  "A#2": 2 ^ (4 / 12),
  B2: 2 ^ (5 / 12),
  C2: 2 ^ (6 / 12),
  "C#2": 2 ^ (7 / 12),
  D2: 2 ^ (8 / 12),
  "D#2": 2 ^ (9 / 12),
  E2: 2 ^ (10 / 12),
  F2: 2 ^ (11 / 12),
  "F#3": 2
};

parsedTracks.forEach((track, trackNumber) => {
  const dataRoot = "./datapack/data/midi2datapack";

  let filenamePrefix = `track${trackNumber}`;

  track.notes.forEach((n, i) => {
    let filename = `${filenamePrefix}-tick${i.toString()}.mcfunction`;
    console.log(filename);
  });
});

console.log(midi);
