// JSONファイルからショートコードと絵文字のマッピングを読み込む
export async function loadEmojiMap(filePath: string): Promise<Record<string, string>> {
    const jsonData = await Deno.readTextFile(filePath);
    return JSON.parse(jsonData);
}

// 未対応のショートコードを検出するリスト
const unknownShortcodes: Set<string> = new Set();

// ショートコードをUnicode絵文字に置き換え
export function replaceShortcodesWithUnicode(
    text: string,
    emojiMap: Record<string, string>,
): string {
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcode) => {
        if (!emojiMap[shortcode]) {
            unknownShortcodes.add(shortcode); // 未対応のショートコードを記録
        }
        return emojiMap[shortcode] || match; // マッチする絵文字があれば置き換え
    });
}

// 未対応のショートコードをログファイルに保存
export async function saveUnknownShortcodesLog(filePath: string) {
    if (unknownShortcodes.size === 0) {
        console.log("No unknown shortcodes detected.");
        return;
    }

    const logContent = Array.from(unknownShortcodes)
        .map((shortcode) => `:${shortcode}:`)
        .join("\n");
    await Deno.writeTextFile(filePath, logContent);
    console.log(`Unknown shortcodes logged to ${filePath}`);
}

// 未対応のショートコードをJSON形式でログに保存
export async function saveUnknownShortcodesJSON(filePath: string) {
    if (unknownShortcodes.size === 0) {
        console.log("No unknown shortcodes detected.");
        return;
    }

    const logContent = JSON.stringify(
        Array.from(unknownShortcodes).reduce((acc, shortcode) => {
            acc[shortcode] = ""; // 絵文字を埋め込むために空の値を設定
            return acc;
        }, {} as Record<string, string>),
        null,
        2,
    );
    await Deno.writeTextFile(filePath, logContent);
    console.log(`Unknown shortcodes logged to ${filePath}`);
}
