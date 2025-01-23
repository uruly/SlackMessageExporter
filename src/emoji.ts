import { Emoji } from "./types/Emoji.ts";

const emojiList: Emoji[] = [];
// 未対応のショートコードを検出するリスト
const unknownShortcodes: Set<string> = new Set();

// JSONファイルからショートコードと絵文字のマッピングを読み込む
export async function loadEmojiList(filePath: string) {
    const jsonData = await Deno.readTextFile(filePath);
    const json: Record<string, string> = JSON.parse(jsonData);
    if (json) {
        Object.entries(json).map(([key, value]) => {
            emojiList.push({
                shortcode: key,
                unicode: value || ""
            })
        })
    }
}

// ショートコードをUnicode絵文字に置き換え
export function replaceShortcodesWithUnicode(
    text: string
): string {
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcode) => {
        const emoji = emojiList.find(emoji => emoji.shortcode === shortcode);
        if (!emoji) {
            unknownShortcodes.add(shortcode); // 未対応のショートコードを記録
        }
        return emoji?.unicode || match; // マッチする絵文字があれば置き換え
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
