import { replaceShortcodesWithUnicode } from "./emoji.ts";
import { Info } from "./types/Info.ts";
import { Message } from "./types/Message.ts";
import {
  addNewlinesToCodeBlocks,
  formatBlockQuotesAndEntities,
  formatListItems,
  formatTimestampToJST,
} from "./utils/formatter.ts";
import { CSS, render } from "@deno/gfm";

// HTML出力を作成
export async function saveMessagesToHTML(
  messages: Message[],
  info: Info,
  filePath: string,
  attachmentDir: string,
) {
  const header = ["Timestamp (JST)", "User", "Text", "Attachment"];
  const rows = await Promise.all(
    messages.map((message) => {
      const timestamp = formatTimestampToJST(message.timestamp);
      const parsedText = formatMessage(message.text || "");
      const markdownContent = render(parsedText);
      const attachments = message.attachments;
      const userName = message.user?.realName ?? "Unknown User";
      const userIcon = message.user?.iconURL

      const attachmentHTML = attachments.map((attachment) => {
        const source = `${attachmentDir}/${attachment.filePath}`;
        if (attachment.fileType == "png" || attachment.fileType == "jpg") {
          return `<a href="${source}" target="_blank"><img src="${source}" width="150" alt="${attachment.title} /></a>"`;
        } else if (
          attachment.fileType == "mp4" || attachment.fileType == "mov"
        ) {
          return `<video controls width="150"><source src="${source}" type="video/${attachment.fileType}" /></video><a href="${source}" target="_blank">${attachment.name}</a>`;
        } else {
          return `<a href="${source}" target="_blank">${attachment.name}</a>`;
        }
      }).join(",");

      return `<tr>
          <td>${timestamp}</td>
          <td>${userIcon && `<img src="${userIcon}" width="50" />`}${userName}</td>
          <td class="markdown-body">${markdownContent}</td>
          <td>
            ${attachmentHTML}
            </td>
        </tr>`;
    }),
  );

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>Slack Messages</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          ${CSS}
        </style>
      </head>
      <body>
        <h1>${info.channelName} | ${info.workspaceName}</h1>
        <table>
          <thead>
            <tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.join("\n")}
          </tbody>
        </table>
      </body>
      </html>
    `;

  await Deno.writeTextFile(filePath, htmlContent);
  console.log(`Messages successfully saved to ${filePath}`);
}

function formatMessage(text: string): string {
  text = addNewlinesToCodeBlocks(text);
  text = formatBlockQuotesAndEntities(text);
  text = formatListItems(text);
  text = replaceShortcodesWithUnicode(text); // ショートコードをUnicodeに変換";
  return text;
}
