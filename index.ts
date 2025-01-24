import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { loadEmojiList, saveUnknownShortcodesJSON } from "./src/emoji.ts";
import { fetchUsers } from "./src/fetchUsers.ts";
import { fetchMessages } from "./src/fetchMessages.ts";
import { saveMessagesToCSV } from "./src/exportCSV.ts";
import { saveMessagesToHTML } from "./src/exportHTML.ts";
import { saveAttachments } from "./src/saveAttachments.ts";
import { config } from "./src/wizard.ts";

const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN");
const SLACK_CHANNEL_ID = Deno.env.get("SLACK_CHANNEL_ID");

const emojiMapFilePath = "./emoji_map.json";
const outputDir = `./${config.outputFolderPath}`;
const attachmentDir = outputDir + "/attachments";
const csvFilePath = outputDir + "/slack_messages.csv";
const htmlFilePath = outputDir + "/slack_messages.html";
const logFilePath = "./unknown_shortcodes.json";

async function main() {
    if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
        console.error(
            "SLACK_BOT_TOKEN または SLACK_CHANNEL_ID が設定されていません。",
        );
        return;
    }

    // 絵文字を読み込む
    await loadEmojiList(emojiMapFilePath);

    const users = await fetchUsers();
    const messages = await fetchMessages(SLACK_CHANNEL_ID, users);
    if (messages.length === 0) {
        console.log("No messages found.");
        return;
    }

    await ensureDir(outputDir);

    // Attachmentsを保存する
    if (config.saveAttachments) {
        await ensureDir(attachmentDir);

        await saveAttachments(
            messages.flatMap((message) => message.attachments),
            attachmentDir,
        );
    }

    // CSV ファイルとして保存
    if (config.exportCSV) {
        await saveMessagesToCSV(messages, csvFilePath);
    }
    // HTML ファイルとして保存
    if (config.exportHTML) {
        await saveMessagesToHTML(messages, htmlFilePath, "./attachments");
    }

    await saveUnknownShortcodesJSON(logFilePath); // 未対応ショートコードをログに保存
}

main().catch((err) => console.error(err));
