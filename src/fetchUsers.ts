import { SLACK_BOT_TOKEN } from "./settings.ts";
import { User } from "./types/User.ts";

export async function fetchUsers(): Promise<User[]> {
    const url = "https://slack.com/api/users.list";
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();

    if (!data.ok) {
        console.error("Error fetching users:", data.error);
        return [];
    }

    // ユーザーIDと名前のマッピングを作成
    const users: Array<User> = [];
    for (const member of data.members) {
        users.push({
            id: member.id,
            realName: member.real_name || member.name || "Unknown User",
            iconURL:  member.profile.image_48
        })
    }

    return users;
}