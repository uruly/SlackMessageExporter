// 必要なモジュールをインポート
import { writeCSV } from "https://deno.land/x/csv@v0.9.1/mod.ts";
import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import {
    loadEmojiMap,
    replaceShortcodesWithUnicode,
    saveUnknownShortcodesJSON,
} from "./src/emoji.ts";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN");
const SLACK_CHANNEL_ID = Deno.env.get("SLACK_CHANNEL_ID");

const emojiMapFilePath = "./emoji_map.json";
const outputDir = "./outputs";
const imageOutputDir = "./outputs/images";
const filePath = "./outputs/slack_messages.csv";
const logFilePath = "./unknown_shortcodes.json";

// Slack API: ユーザー一覧を取得
async function fetchUserMap(): Promise<Record<string, string>> {
    const url = "https://slack.com/api/users.list";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();

    if (!data.ok) {
        console.error("Error fetching users:", data.error);
        return {};
    }

    // ユーザーIDと名前のマッピングを作成
    const userMap: Record<string, string> = {};
    for (const member of data.members) {
        userMap[member.id] = member.real_name || member.name || "Unknown User";
    }

    return userMap;
}

// Slack API を使ってメッセージを取得する関数
async function fetchMessages(channelId: string): Promise<any[]> {
    let messages: any[] = [];
    let nextCursor: string | undefined;
    let pageIndex = 1;

    do {
        console.log(pageIndex + "ページ目を取得中...");
        const url =
            `https://slack.com/api/conversations.history?channel=${channelId}${
                nextCursor ? `&cursor=${nextCursor}` : ""
            }`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        if (!data.ok) {
            console.error("Error fetching messages:", data.error);
            return [];
        }

        // メッセージを追加
        messages = messages.concat(data.messages);

        // 次のページのカーソルを取得
        pageIndex += 1;
        nextCursor = data.response_metadata?.next_cursor;
    } while (nextCursor); // 次のカーソルが存在する場合はループを継続

    // 日付の古い順にソート
    return messages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
}

// 添付ファイルをローカルに保存し、リンクを作成
async function saveAttachments(
    files: any[],
    outputDir: string,
): Promise<string> {
    if (!files || files.length === 0) return "";

    await ensureDir(outputDir); // ディレクトリを作成

    const links = await Promise.all(
        files.map(async (file: any) => {
            if (!file.url_private) return "";

            const originalFileName = file.name || `${file.id}.unknown`; // 名前がない場合のデフォルト名
            const sanitizedFileName = sanitizeFileName(originalFileName);
            const filePath = `${imageOutputDir}/${sanitizedFileName}`;

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
                return sanitizedFileName
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
      .replace(/[（）:/"<>|?*]/g, "") // 特定の特殊文字を削除
  }

// メッセージを CSV に保存する関数
async function saveMessagesToCSV(
    messages: any[],
    userMap: Record<string, string>,
    emojiMap: Record<string, string>,
    filePath: string,
) {
    // rows を生成するジェネレータ関数
    async function* generateRows() {
        // ヘッダーを最初に出力
        yield ["timestamp (JST)", "user", "text", "attachment"];
        // 各メッセージを出力
        for (const message of messages) {
            yield [
                formatTimestampToJST(message.ts),
                userMap[message.user] || "Unknown User", // ユーザーIDを名前に変換
                replaceShortcodesWithUnicode(message.text || "", emojiMap), // ショートコードをUnicodeに変換
                await saveAttachments(message.files || [], imageOutputDir), // 添付ファイルのリンクを取得
            ];
        }
    }

    // ファイルを開く
    const file = await Deno.open(filePath, {
        write: true,
        create: true,
        truncate: true,
    });

    try {
        // `generateRows` を渡して CSV を書き込む
        await writeCSV(file, generateRows());
        console.log(`Messages successfully saved to ${filePath}`);
    } finally {
        // ファイルを閉じる
        file.close();
    }
}

// エポック秒を日本時間にフォーマットされた日付文字列に変換する関数
function formatTimestampToJST(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000); // エポック秒からミリ秒に変換
    return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }); // 日本時間でフォーマット
}

async function main() {
    if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
        console.error(
            "SLACK_BOT_TOKEN または SLACK_CHANNEL_ID が設定されていません。",
        );
        return;
    }
    const emojiMap = await loadEmojiMap(emojiMapFilePath);

    // ユーザーマッピングを取得
    const userMap = await fetchUserMap();

    const messages = await fetchMessages(SLACK_CHANNEL_ID);
    if (messages.length === 0) {
        console.log("No messages found.");
        return;
    }

    await ensureDir(outputDir); // ディレクトリを作成
    await ensureDir(imageOutputDir);

    // CSV ファイルとして保存
    await saveMessagesToCSV(messages, userMap, emojiMap, filePath);

    await saveUnknownShortcodesJSON(logFilePath); // 未対応ショートコードをログに保存
}

main().catch((err) => console.error(err));
