import fs from "node:fs";
import path from "node:path";

const SEED = 2026;


function createRandom(seed) {
  let state = seed >>> 0;

  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = createRandom(SEED);

const types = ["cpu", "gpu", "ram", "disk"];

const names = {
  cpu: "Procesor",
  gpu: "Karta graficzna",
  ram: "Pamięć RAM",
  disk: "Dysk SSD",
};

const images = {
  cpu: "/images/products/cpu.webp",
  gpu: "/images/products/gpu.webp",
  ram: "/images/products/ram.webp",
  disk: "/images/products/disk.webp",
};

const products = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1;

  const type = types[index % types.length];

  const price =
    Math.floor(random() * (500000 - 10000 + 1)) + 10000;

  const amount =
    id % 7 === 0
      ? 0
      : Math.floor(random() * 20) + 1;

  return {
    id,


    code: `PRD${String(id).padStart(7, "0")}`,

    name: `${names[type]} ${String(id).padStart(3, "0")}`,

    type,

    price,

    amount,

    description: `${names[type]} - produkt numer ${id}.`,

    date: new Date(
      Date.UTC(2026, 0, 1 + index)
    ).toISOString(),

    image: images[type],
  };
});

const outputDirectory = path.join(
  process.cwd(),
  "data"
);

const outputPath = path.join(
  outputDirectory,
  "products.json"
);

fs.mkdirSync(outputDirectory, {
  recursive: true,
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(products, null, 2),
  "utf8"
);

console.log(
  `Wygenerowano ${products.length} produktów.`
);
console.log(`Użyte ziarno: ${SEED}`);
console.log(`Plik: ${outputPath}`);

//node scripts/generate-products.mjs