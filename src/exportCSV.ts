import { writeCSV } from "https://deno.land/x/csv@v0.9.1/mod.ts";
import { formatTimestampToJST } from "./utils/formatter.ts";
import { User } from "./types/User.ts";
import { replaceShortcodesWithUnicode } from "./emoji.ts";
import { saveAttachments } from "./fetchAttachments.ts";

// メッセージを CSV に保存する関数
export async function saveMessagesToCSV(
    messages: any[],
    users: Array<User>,
    emojiMap: Record<string, string>,
    filePath: string,
) {
    const attachmentDir = filePath + "/attachments";
    // rows を生成するジェネレータ関数
    async function* generateRows() {
        // ヘッダーを最初に出力
        yield ["timestamp (JST)", "user", "text", "attachment"];
        // 各メッセージを出力
        for (const message of messages) {
            const user = users.find(user => user.id === message.user);
            yield [
                formatTimestampToJST(message.ts),
                user?.realName || "Unknown User", // ユーザーIDを名前に変換
                replaceShortcodesWithUnicode(message.text || "", emojiMap), // ショートコードをUnicodeに変換
                await saveAttachments(message.files || [], attachmentDir), // 添付ファイルのリンクを取得 ここどうにかしたいね
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