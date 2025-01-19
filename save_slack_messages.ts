// 必要なモジュールをインポート
import { writeCSV } from "https://deno.land/x/csv@v0.9.1/mod.ts";
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"

const env = await load();
const SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = env.SLACK_CHANNEL_ID;

// Slack API を使ってメッセージを取得する関数
async function fetchMessages(channelId: string): Promise<any[]> {
  const url = `https://slack.com/api/conversations.history?channel=${channelId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  const data = await response.json();
  console.log(data);

  if (!data.ok) {
    console.error("Error fetching messages:", data.error);
    return [];
  }

  return data.messages;
}

// メッセージを CSV に保存する関数
async function saveMessagesToCSV(messages: any[], filePath: string) {
    // rows を生成するジェネレータ関数
    async function* generateRows() {
      // ヘッダーを最初に出力
      yield ["timestamp", "user", "text"];
      // 各メッセージを出力
      for (const message of messages) {
        yield [message.ts, message.user, message.text];
      }
    }
  
    // ファイルを開く
    const file = await Deno.open(filePath, { write: true, create: true, truncate: true });
  
    try {
      // `generateRows` を渡して CSV を書き込む
      await writeCSV(file, generateRows());
      console.log(`Messages successfully saved to ${filePath}`);
    } finally {
      // ファイルを閉じる
      file.close();
    }
  }


// メイン関数
async function main() {
  const messages = await fetchMessages(SLACK_CHANNEL_ID);
  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  // CSV ファイルとして保存
  const filePath = "./slack_messages.csv";
  await saveMessagesToCSV(messages, filePath);
}

main().catch((err) => console.error(err));
