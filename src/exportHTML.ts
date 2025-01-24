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
      const parsedText = formatBlockQuotesAndEntities(addNewlinesToCodeBlocks(text));
      const markdownContent = render(parsedText);
      const attachments = message.attachments;
      const userName = message.user?.realName ?? "Unknown User";

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

/**
 * コードブロックの開始部分と終了部分に改行を追加する関数
 * @param markdown 修正対象の Markdown テキスト
 * @returns 修正後の Markdown テキスト
 */
function addNewlinesToCodeBlocks(markdown: string): string {
  // 開始部分（```）の後に改行を追加
  markdown = markdown.replace(/```(\S*?)\r?\n?/g, (_, lang) => `\`\`\`${lang}\n`);
  // 終了部分（}```）の前に改行を追加
  markdown = markdown.replace(/\s*```/g, "\n```");
  return markdown;
}

/**
 * Markdown テキストを整形して引用を正しくパースできるようにする関数
 * - `&gt;` を `>` に変換
 * - 引用ブロックを Markdown の形式に整形
 * @param text 修正対象の Markdown テキスト
 * @returns 修正後の Markdown テキスト
 */
function formatBlockQuotesAndEntities(text: string): string {
  // `&gt;` を `>` に変換
  text = text.replace(/&gt;/g, ">");

  // 引用ブロックを整形
  text = text.replace(/(?:^|\n)> (.*?)(?=\n|$)/g, (_match, p1) => {
    const formatted = p1.trim().split("\n").map((line: string) => `> ${line.trim()}`).join("\n");
    return `\n${formatted}\n`;
  });

  return text;
}