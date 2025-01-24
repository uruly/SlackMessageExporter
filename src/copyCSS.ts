export async function copyCSS(outputDir: string) {
  const sourceFile = new URL("./style/style.css", import.meta.url).pathname;; // コピー元のファイル
  const targetFolder = new URL("../outputs/", import.meta.url).pathname;
  const targetFile = `${targetFolder}/style.css`;

  try {
    console.log(`Copied ${sourceFile} to ${targetFile}`);
    await Deno.copyFile(sourceFile, targetFile);
    console.log(`Copied ${sourceFile} to ${targetFile}`);
  } catch (err) {
    console.error("Error copying file:", err);
  }
}