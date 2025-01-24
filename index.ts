import { ensureDir } from "https://deno.land/std@0.200.0/fs/mod.ts";
import { loadEmojiList, saveUnknownShortcodesJSON } from "./src/emoji.ts";
import { fetchInfo } from "./src/fetchInfo.ts";
import { fetchUsers } from "./src/fetchUsers.ts";
import { fetchMessages } from "./src/fetchMessages.ts";
import { saveMessagesToCSV } from "./src/exportCSV.ts";
import { saveMessagesToHTML } from "./src/exportHTML.ts";
import { saveAttachments } from "./src/saveAttachments.ts";
import { config } from "./src/wizard.ts";
import { SLACK_BOT_TOKEN } from "./src/settings.ts";
import { copyCSS } from "./src/copyCSS.ts";

const emojiMapFilePath = "./emoji_map.json";
const outputDir = `${config.outputFolderPath}`;
const attachmentDir = "attachments";
const logFilePath = "./unknown_shortcodes.json";

async function main() {
  if (!SLACK_BOT_TOKEN || !config.channelID) {
    console.error(
      "SLACK_BOT_TOKEN または SLACK_CHANNEL_ID が設定されていません。",
    );
    return;
  }

  const outputPath = `./${outputDir}`;

  // 絵文字を読み込む
  await loadEmojiList(emojiMapFilePath);

  const info = await fetchInfo(config.channelID);

  const users = await fetchUsers();
  const messages = await fetchMessages(config.channelID, users);
  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  await ensureDir(outputPath);

  // Attachmentsを保存する
  if (config.saveAttachments) {
    const attachmentPath = `./${outputDir}/${attachmentDir}`;
    await ensureDir(attachmentPath);

    await saveAttachments(
      messages.flatMap((message) => message.attachments),
      attachmentPath,
    );
  }

  // CSV ファイルとして保存
  if (config.exportCSV) {
    const csvFilePath =
      `${outputPath}/${info.workspaceName}_${info.channelName}.csv`;
    await saveMessagesToCSV(messages, csvFilePath);
  }
  // HTML ファイルとして保存
  if (config.exportHTML) {
    const htmlFilePath =
      `${outputPath}/${info.workspaceName}_${info.channelName}.html`;
    await saveMessagesToHTML(
      messages,
      info,
      htmlFilePath,
      `./${attachmentDir}`,
    );
    // CSSファイルを配置する
    await copyCSS(outputDir);
  }

  await saveUnknownShortcodesJSON(logFilePath); // 未対応ショートコードをログに保存
}

main().catch((err) => console.error(err));
