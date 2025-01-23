import { SLACK_BOT_TOKEN } from "./settings.ts";
import { Attachment } from "./types/Attachments.ts";
import { Message } from "./types/Message.ts";
import { User } from "./types/User.ts";

// Slack API を使ってメッセージを取得する関数
export async function fetchMessages(
    channelId: string,
    users: User[],
): Promise<any[]> {
    let messages: Message[] = [];
    let nextCursor: string | undefined;
    let pageIndex = 1;

    do {
        console.log(pageIndex + "ページ目を取得中...");
        const url =
            `https://slack.com/api/conversations.history?channel=${channelId}${
                nextCursor ? `&cursor=${nextCursor}` : ""
            }`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        if (!data.ok) {
            console.error("Error fetching messages:", data.error);
            return [];
        }
        const currentPageMessages = data.messages.map((message: any) => {
            let files: Attachment[] = []
            if (message.files && message.files?.length > 0) {
                files = message.files.map((file: any) => {
                    return {
                        id: file.id, // "F01BSD8NY1F"
                        name: file.name, // "hoge.png"
                        title: file.title, // "hoge"
                        fileType: file.filetype, // "png"
                        filePath: file.id + "-" + file.name, // "F01BSD8NY1F-hoge.png"
                        url: file.url_private, // "https://files.slack.com/files-pri/hoge.png"
                    };
                });
            }
            return {
                timestamp: message.ts,
                user: users.find((user) => user.id === message.user),
                text: message.text || "",
                attachments: files,
            };
        });
        // メッセージを追加
        messages = messages.concat(currentPageMessages);

        // 次のページのカーソルを取得
        pageIndex += 1;
        nextCursor = data.response_metadata?.next_cursor;
    } while (nextCursor); // 次のカーソルが存在する場合はループを継続

    // 日付の古い順にソート
    return messages.sort((a, b) =>
        parseFloat(a.timestamp) - parseFloat(b.timestamp)
    );
}
