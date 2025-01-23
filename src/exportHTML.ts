import { replaceShortcodesWithUnicode } from "./emoji.ts";
import { Message } from "./types/Message.ts";
import { formatTimestampToJST } from "./utils/formatter.ts";

// HTML出力を作成
export async function saveMessagesToHTML(
    messages: Message[],
    filePath: string,
) {
    const header = ["Timestamp (JST)", "User", "Text", "Attachment"];
    const rows = await Promise.all(
        messages.map(async (message) => {
            const timestamp = formatTimestampToJST(message.timestamp)
            const text = replaceShortcodesWithUnicode(message.text || "") // ショートコードをUnicodeに変換";
            const attachments = message.attachments;
            const userName = message.user?.realName ?? "Unknowon User";

            return `<tr>
          <td>${timestamp}</td>
          <td>${userName}</td>
          <td>${text}</td>
            ${attachments ? attachments.map((attachment) => 
                `<td><a href="./attachments/${attachment}" target="_blank">${attachment}</a></td>`
            ).join("") : `<td></td>`}
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
