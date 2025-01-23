export type Attachment = {
    id: string,  // "F01BSD8NY1F"
    name: string, // "hoge.png"
    title: string, // "hoge"
    fileType: string, // "png"
    filePath: string, // id + name (ファイル名の重複を避けるため)
    url: string // "https://files.slack.com/files-pri/hoge.png"
}