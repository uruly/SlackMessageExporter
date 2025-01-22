import { replaceShortcodesWithUnicode } from "./loadEmoji.ts";
import { saveAttachments } from "./fetchAttachments.ts";
import { User } from "./types/User.ts";
import { formatTimestampToJST } from "./utils/formatter.ts";
import { Emoji } from "./types/Emoji.ts";

// HTML出力を作成
export async function saveMessagesToHTML(
    messages: any[],
    users: User[],
    emojiList: Emoji[],
    filePath: string,
) {
    const header = ["Timestamp (JST)", "User", "Text", "Attachment"];
    const attachmentDir = filePath + "/attachments";
    const rows = await Promise.all(
        messages.map(async (message) => {
            const user = users.find(user => user.id === message.user);
            const timestamp = formatTimestampToJST(message.ts)
            const text = replaceShortcodesWithUnicode(message.text || "", emojiList) // ショートコードをUnicodeに変換";
            const attachment = await saveAttachments(
                message.files || [],
                attachmentDir
            );
            const userName = user?.realName ?? "Unknowon User";

            return `<tr>
          <td>${timestamp}</td>
          <td>${userName}</td>
          <td>${text}</td>
          <td><a href="./attachments/${attachment}" target="_blank">${attachment}</a></td>
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
