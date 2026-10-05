/**
 * Converte as fotos selecionadas da pasta carrocel_chocolicia para WebP
 * e salva em client/public/images/carrossel/
 * Configuração: qualidade 80, largura máxima 1200px
 */
import sharp from "sharp";
import { mkdirSync, statSync } from "fs";
import { join } from "path";

const outputDir = join(process.cwd(), "client", "public", "images", "carrossel");
mkdirSync(outputDir, { recursive: true });

const inputFolder = join(process.cwd(), "carrocel_chocolicia");

// Mapeamento: arquivo original → nome de saída
const photos = [
  {
    input: "WhatsApp Image 2026-10-02 at 18.47.07.jpeg",
    output: "cupcakes-powerpuff-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.48.11 (1).jpeg",
    output: "bolo-fundo-do-mar-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.48.11.jpeg",
    output: "mesa-fundo-do-mar-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.52.42.jpeg",
    output: "mesa-bluey-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.53.28.jpeg",
    output: "cupcakes-bluey-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.53.58.jpeg",
    output: "bolo-fundo-do-mar-02.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.54.36.jpeg",
    output: "bolo-naked-frutas-01.webp",
  },
  {
    input: "WhatsApp Image 2026-10-02 at 18.58.06.jpeg",
    output: "conjunto-bolo-doces-01.webp",
  },
];

console.log("\n🎨  Convertendo fotos para WebP...\n");
console.log("Arquivo saída".padEnd(40), "Tamanho final".padStart(15), "  Status");
console.log("-".repeat(70));

let total = 0;

for (const photo of photos) {
  const inputPath = join(inputFolder, photo.input);
  const outputPath = join(outputDir, photo.output);

  try {
    await sharp(inputPath)
      .resize(1200, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const sizeKB = Math.round(statSync(outputPath).size / 1024);
    total += sizeKB;
    const status = sizeKB > 150 ? "⚠️  acima de 150 KB" : "✅";
    console.log(photo.output.padEnd(40), `${sizeKB} KB`.padStart(15), `  ${status}`);
  } catch (err) {
    console.error(`❌ Erro ao converter ${photo.input}:`, err);
  }
}

console.log("-".repeat(70));
console.log(`Total: ${total} KB (${(total / 1024).toFixed(1)} MB)`);
console.log(total <= 1500 ? "\n✅ Peso total dentro do limite de ~1,5 MB" : "\n⚠️  Peso total acima do limite");
