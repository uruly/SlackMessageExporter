import { SLACK_BOT_TOKEN } from "./settings.ts";
import { Attachment } from "./types/Attachments.ts";

// 添付ファイルを取得する
export async function saveAttachments(
    attachments: Attachment[],
    attachmentDir: string
) {
    if (!attachments || attachments.length === 0) return;

    await Promise.all(
        attachments.map(async (attachment: any) => {
            if (!attachment.url) return "";

            const filePath = `${attachmentDir}/${attachment.filePath}`;

            try {
                const response = await fetch(attachment.url, {
                    headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
                });

                if (!response.ok) {
                    console.error(
                        `Failed to download file: ${attachment.url}`,
                    );
                    return;
                }

                const fileData = new Uint8Array(await response.arrayBuffer());
                await Deno.writeFile(filePath, fileData);
                console.log(`Saved file: ${filePath}`);
                return;
            } catch (error) {
                console.error(`Error saving file ${attachment.url}:`, error);
                return;
            }
        }),
    );
}