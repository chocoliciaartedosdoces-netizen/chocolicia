/**
 * Analisa as fotos da pasta carrocel_chocolicia:
 * - Calcula a média de max(R,G,B) - min(R,G,B) por pixel para detectar imagens em tons de cinza
 * - Mostra tabela com nome, valor calculado e decisão
 */
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

const folder = join(process.cwd(), "carrocel_chocolicia");

const files = readdirSync(folder).filter((f) => {
  const ext = extname(f).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext);
});

console.log("\n📷  Análise de colorimetria das fotos\n");
console.log("Arquivo".padEnd(55), "Saturação média", "Decisão");
console.log("-".repeat(90));

const results: Array<{ file: string; sat: number; keep: boolean; reason: string }> = [];

for (const file of files) {
  const filePath = join(folder, file);
  try {
    const { data, info } = await sharp(filePath)
      .resize(64, 64, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels; // 3 (RGB) ou 4 (RGBA)
    let totalSat = 0;
    const pixelCount = info.width * info.height;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      totalSat += max - min;
    }

    const avgSat = totalSat / pixelCount;
    const keep = avgSat >= 8;
    const reason = keep ? "colorida" : "preto e branco / sem cor";

    results.push({ file, sat: avgSat, keep, reason });

    const decision = keep ? "✅ usada" : "❌ descartada";
    console.log(
      file.padEnd(55),
      avgSat.toFixed(1).padStart(15),
      `  ${decision} (${reason})`,
    );
  } catch (err) {
    console.error(`Erro ao processar ${file}:`, err);
  }
}

console.log("\n");
console.log(`Total: ${results.length} fotos`);
console.log(`Coloridas: ${results.filter((r) => r.keep).length}`);
console.log(`Descartadas: ${results.filter((r) => !r.keep).length}`);
