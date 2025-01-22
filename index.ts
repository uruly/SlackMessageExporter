// 必要なモジュールをインポート
import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { loadEmojiMap, saveUnknownShortcodesJSON } from "./src/emoji.ts";
import { fetchUsers } from "./src/fetchUsers.ts";
import { fetchMessages } from "./src/fetchMessages.ts";
import { saveMessagesToCSV } from "./src/exportCSV.ts";
import { saveMessagesToHTML } from "./src/exportHTML.ts";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN");
const SLACK_CHANNEL_ID = Deno.env.get("SLACK_CHANNEL_ID");

const emojiMapFilePath = "./emoji_map.json";
const outputDir = "./outputs";
const attachmentDir = "./outputs/attachments";
const filePath = "./outputs/slack_messages.csv";
const logFilePath = "./unknown_shortcodes.json";
const htmlPath = "./outputs/slack_messages.html";

async function main() {
    if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
        console.error(
            "SLACK_BOT_TOKEN または SLACK_CHANNEL_ID が設定されていません。",
        );
        return;
    }
    const emojiMap = await loadEmojiMap(emojiMapFilePath);

    // ユーザーマッピングを取得
    const users = await fetchUsers();
    const messages = await fetchMessages(SLACK_CHANNEL_ID);
    if (messages.length === 0) {
        console.log("No messages found.");
        return;
    }

    await ensureDir(outputDir); // ディレクトリを作成
    await ensureDir(attachmentDir);

    // CSV ファイルとして保存
    await saveMessagesToCSV(messages, users, emojiMap, filePath);
    // HTML ファイルとして保存
    await saveMessagesToHTML(messages, users, emojiMap, htmlPath);

    await saveUnknownShortcodesJSON(logFilePath); // 未対応ショートコードをログに保存
}

main().catch((err) => console.error(err));
