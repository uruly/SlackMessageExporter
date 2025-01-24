import { replaceShortcodesWithUnicode } from "./emoji.ts";
import { Message } from "./types/Message.ts";
import { formatTimestampToJST } from "./utils/formatter.ts";
import { CSS, render } from "@deno/gfm";

// HTML出力を作成
export async function saveMessagesToHTML(
  messages: Message[],
  filePath: string,
  attachmentDir: string,
) {
  const header = ["Timestamp (JST)", "User", "Text", "Attachment"];
  const rows = await Promise.all(
    messages.map((message) => {
      const timestamp = formatTimestampToJST(message.timestamp);
      const text = replaceShortcodesWithUnicode(message.text || ""); // ショートコードをUnicodeに変換";
      const markdownContent = render(text);
      const attachments = message.attachments;
      const userName = message.user?.realName ?? "Unknowon User";

      return `<tr>
          <td>${timestamp}</td>
          <td>${userName}</td>
          <td class="markdown-body">${markdownContent}</td>
          <td>
            ${
        attachments.map((attachment) =>
          `<a href="${attachmentDir}/${attachment.filePath}" target="_blank">${attachment.name}</a>`
        ).join(",")
      }
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
        <h1>Slack Messages</h1>
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
