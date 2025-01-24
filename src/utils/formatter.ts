// エポック秒を日本時間にフォーマットされた日付文字列に変換する関数
export function formatTimestampToJST(timestamp: string): string {
  const date = new Date(parseFloat(timestamp) * 1000); // エポック秒からミリ秒に変換
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }); // 日本時間でフォーマット
}

/**
 * コードブロックの開始部分と終了部分に改行を追加する関数
 * @param markdown 修正対象の Markdown テキスト
 * @returns 修正後の Markdown テキスト
 */
export function addNewlinesToCodeBlocks(markdown: string): string {
  // 開始部分（```）の後に改行を追加
  markdown = markdown.replace(
    /```(\S*?)\r?\n?/g,
    (_, lang) => `\`\`\`${lang}\n`,
  );
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
export function formatBlockQuotesAndEntities(text: string): string {
  // `&gt;` を `>` に変換
  text = text.replace(/&gt;/g, ">");

  // 引用ブロックを整形
  text = text.replace(/(?:^|\n)> (.*?)(?=\n|$)/g, (_match, p1) => {
    const formatted = p1.trim().split("\n").map((line: string) =>
      `> ${line.trim()}`
    ).join("\n");
    return `\n${formatted}\n`;
  });

  return text;
}

/**
 * リスト項目を適切に改行し、Markdown のリスト形式に修正する関数
 * @param text 修正対象のテキスト
 * @returns 修正後のテキスト
 */
export function formatListItems(text: string): string {
  // リスト項目（「・」で始まる行）を Markdown のリスト形式に変換
  text = text.replace(
    /(?:^|\n)・(.+?)(?=\n|$)/g,
    (_, item) => `\n- ${item.trim()}`,
  );

  // 行末にスペース 2 つを追加して改行を保持
  text = text.replace(/([^\n])\n/g, "$1  \n");
  return text;
}
