import {
    Confirm,
    Input,
} from "https://deno.land/x/cliffy@v1.0.0-rc.1/prompt/mod.ts";

interface Config {
    exportCSV: boolean; // CSVとして吐き出すかどうか
    exportHTML: boolean; // htmlを吐き出すかどうか
    saveAttachments: boolean; // 添付ファイルをローカルに保存するかどうか
    outputFolderPath: string; // 書き出しフォルダ
}

async function getConfig(): Promise<Config> {
    const exportCSV = await Confirm.prompt({
        message: "CSVファイルを書き出しますか?",
        default: true,
    });

    const exportHTML = await Confirm.prompt({
        message: "HTMLファイルを書き出しますか?",
        default: true,
    });

    const saveAttachments = await Confirm.prompt({
        message: "添付ファイルを保存しますか?",
        default: true,
    });

    const outputFolderPath = await Input.prompt({
        message: "Path to output folder",
        default: "output",
    });

    return {
        exportCSV,
        exportHTML,
        saveAttachments,
        outputFolderPath,
    };
}

export const config = await getConfig();
console.log("Configuration:", config);
