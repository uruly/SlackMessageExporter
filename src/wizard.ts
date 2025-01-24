import {
    Confirm,
    Input,
} from "https://deno.land/x/cliffy@v1.0.0-rc.1/prompt/mod.ts";
import { SLACK_CHANNEL_ID } from "./settings.ts";

interface Config {
    channelID: string;   // チャンネルID
    exportCSV: boolean; // CSVとして吐き出すかどうか
    exportHTML: boolean; // htmlを吐き出すかどうか
    saveAttachments: boolean; // 添付ファイルをローカルに保存するかどうか
    outputFolderPath: string; // 書き出しフォルダ
}

async function getConfig(): Promise<Config> {
    const channelID = await Input.prompt({
        message: "Slack Channel ID (By default, use the ID written in the .env file)",
        default: SLACK_CHANNEL_ID,
    });

    const exportCSV = await Confirm.prompt({
        message: "Export CSV file?",
        default: true,
    });

    const exportHTML = await Confirm.prompt({
        message: "Export HTML file?",
        default: true,
    });

    const saveAttachments = await Confirm.prompt({
        message: "Save Attachment?",
        default: true,
    });

    const outputFolderPath = await Input.prompt({
        message: "Path to output folder",
        default: "outputs",
    });

    return {
        channelID,
        exportCSV,
        exportHTML,
        saveAttachments,
        outputFolderPath,
    };
}

export const config = await getConfig();
console.log("Configuration:", config);
