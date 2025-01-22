import { SLACK_BOT_TOKEN } from "./settings.ts";

// 添付ファイルをローカルに保存し、リンクを作成
export async function saveAttachments(
    files: any[],
    attachmentDir: string
): Promise<string> {
    if (!files || files.length === 0) return "";

    const links = await Promise.all(
        files.map(async (file: any) => {
            if (!file.url_private) return "";

            const originalFileName = file.name || `${file.id}.unknown`; // 名前がない場合のデフォルト名
            const sanitizedFileName = sanitizeFileName(originalFileName);
            const uniqueFileName = await getUniqueFileName(
                attachmentDir,
                sanitizedFileName,
            );
            const filePath = `${attachmentDir}/${uniqueFileName}`;

            try {
                const response = await fetch(file.url_private, {
                    headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
                });

                if (!response.ok) {
                    console.error(
                        `Failed to download file: ${file.url_private}`,
                    );
                    return "";
                }

                const fileData = new Uint8Array(await response.arrayBuffer());
                await Deno.writeFile(filePath, fileData);
                console.log(`Saved file: ${filePath}`);

                // HYPERLINK形式のリンクを作成
                // return `=HYPERLINK("./images/${sanitizedFileName}", "${sanitizedFileName}")`;
                return uniqueFileName;
            } catch (error) {
                console.error(`Error saving file ${file.url_private}:`, error);
                return "";
            }
        }),
    );

    return links.filter((link) => link).join(", "); // 有効なリンクをカンマ区切りで返す
}

// ファイル名を正規化する関数（日本語を保持）
// ファイル名を正規化し、誤字を修正する関数
function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/\s+/g, "_") // スペースをアンダースコアに置き換え
        .replace(/[（）:/"<>|?*]/g, ""); // 特定の特殊文字を削除
}

// 重複を避けるためのファイル名を生成
async function getUniqueFileName(
    directory: string,
    fileName: string,
): Promise<string> {
    const baseName = fileName.replace(/\.[^/.]+$/, ""); // 拡張子を除いた部分
    const extension = fileName.split(".").pop(); // 拡張子を取得
    let uniqueName = fileName;
    let counter = 1;

    while (await exists(`${directory}/${uniqueName}`)) {
        uniqueName = `${baseName}_${counter}.${extension}`;
        counter++;
    }

    return uniqueName;
}


// ファイルが存在するか確認
async function exists(path: string): Promise<boolean> {
    try {
        await Deno.stat(path);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error;
    }
}
