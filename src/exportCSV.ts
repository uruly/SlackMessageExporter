import { writeCSV } from "https://deno.land/x/csv@v0.9.1/mod.ts";
import { formatTimestampToJST } from "./utils/formatter.ts";
import { replaceShortcodesWithUnicode } from "./emoji.ts";
import { Message } from "./types/Message.ts";

// メッセージを CSV に保存する関数
export async function saveMessagesToCSV(
    messages: Message[],
    filePath: string,
) {
    // rows を生成するジェネレータ関数
    async function* generateRows() {
        // ヘッダーを最初に出力
        yield ["timestamp (JST)", "user", "text", "attachment"];
        // 各メッセージを出力
        for (const message of messages) {
            const user = message.user;
            const attachments = message.attachments.map((attachment) => {
                return `=HYPERLINK(""${attachment.url}"",""${attachment.filePath}"")`
            }).join(" / ");
            yield [
                formatTimestampToJST(message.timestamp),
                user?.realName || "Unknown User", // ユーザーIDを名前に変換
                replaceShortcodesWithUnicode(message.text || ""), // ショートコードをUnicodeに変換
                attachments
            ];
        }
    }

    // ファイルを開く
    const file = await Deno.open(filePath, {
        write: true,
        create: true,
        truncate: true,
    });

    try {
        // `generateRows` を渡して CSV を書き込む
        await writeCSV(file, generateRows());
        console.log(`Messages successfully saved to ${filePath}`);
    } finally {
        // ファイルを閉じる
        file.close();
    }
}