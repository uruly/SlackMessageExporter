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
  let lastYear: number | null = null;

  const rows = await Promise.all(
    messages.map((message) => {
      const timestamp = formatTimestampToJST(message.timestamp);
      const parsedText = formatMessage(message.text || "");
      const markdownContent = render(parsedText);
      const attachments = message.attachments;
      const userName = message.user?.realName ?? "Unknown User";
      const userIcon = message.user?.iconURL;
      const date = new Date(parseFloat(message.timestamp) * 1000);
      const year = date.getFullYear();
      const attachmentHTML = attachments
        .map((attachment) => {
          const source = `${attachmentDir}/${attachment.filePath}`;
          if (attachment.fileType === "png" || attachment.fileType === "jpg") {
            return `<a href="${source}" target="_blank"><img src="${source}" width="150" alt="${attachment.title}" /></a>`;
          } else if (
            attachment.fileType === "mp4" || attachment.fileType === "mov"
          ) {
            return `<video controls width="150"><source src="${source}" type="video/${attachment.fileType}" /></video>`;
          } else {
            return `<a href="${source}" target="_blank">${attachment.name}</a>`;
          }
        })
        .join(" ");

      // 年が変わった最初のメッセージに id を追加
      const yearId = year !== lastYear ? `id="year-${year}"` : "";
      lastYear = year;

      return `
        <article class="message" ${yearId}>
          <header class="message-header">
            ${
        userIcon
          ? `<img src="${userIcon}" alt="${userName}" class="user-icon" />`
          : ""
      }
            <div>
              <h2 class="user-name">${userName}</h2>
              <time datetime="${message.timestamp}">${timestamp}</time>
            </div>
          </header>
          <section class="message-content markdown-body">${markdownContent}</section>
          <footer class="message-attachments">
            ${attachmentHTML}
          </footer>
        </article>
      `;
    }),
  );

  const years = Array.from(
    new Set(
      messages.map((msg) => {
        // タイムスタンプが存在しない場合に対応
        if (!msg.timestamp) {
          console.warn("Missing timestamp in message:", msg);
          return NaN;
        }

        // Slack のタイムスタンプ（例: "1633024800.000200"）を処理
        const timestamp = parseFloat(msg.timestamp) * 1000; // ミリ秒に変換
        const date = new Date(timestamp);

        // 無効な日付の場合に警告
        if (isNaN(date.getTime())) {
          console.warn("Invalid timestamp in message:", msg.timestamp);
          return NaN;
        }

        return date.getFullYear(); // 有効な年を返す
      }),
    ),
  ).filter((year) => !isNaN(year)); // NaN を除外

  const sidebarContent = `
    <div class="sidebar">
      <h2>${info.workspaceName}</h2>
      <h3>#${info.channelName}</h3>
      <ul class="year-navigation">
        ${
    years
      .map(
        (year) => `<li><a href="#year-${year}">${year}年</a></li>`,
      )
      .join("")
  }
      </ul>
    </div>
  `;

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>Slack Messages</title>
        <link rel="stylesheet" href="./style.css">
        <style>
          ${CSS}
        </style>
      </head>
      <body>
      <div class="container">
        ${sidebarContent}
        <main class="main-content">
          <h1>${info.workspaceName} #${info.channelName}</h1>
          ${rows.join("\n")}
        </main>
      </div>
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
