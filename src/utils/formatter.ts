// エポック秒を日本時間にフォーマットされた日付文字列に変換する関数
export function formatTimestampToJST(timestamp: string): string {
    const date = new Date(parseFloat(timestamp) * 1000); // エポック秒からミリ秒に変換
    return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }); // 日本時間でフォーマット
}