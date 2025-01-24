import { SLACK_BOT_TOKEN } from "./settings.ts";
import { Info } from "./types/Info.ts";

export async function fetchInfo(channelID: string): Promise<Info> {
  const workspaceName = await getWorkspaceName();
  const channelName = await getChannelName(channelID);
  return {
    workspaceName: workspaceName || "",
    channelName: channelName || "",
  };
}

async function getWorkspaceName(): Promise<string | null> {
  const response = await fetch("https://slack.com/api/team.info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
  });

  const data = await response.json();
  if (data.ok) {
    return data.team?.name ?? null;
  } else {
    console.error("Error fetching workspace info:", data.error);
    return null;
  }
}

async function getChannelName(channelID: string): Promise<string | null> {
  const response = await fetch(
    `https://slack.com/api/conversations.info?channel=${channelID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
    },
  );

  const data = await response.json();
  if (data.ok) {
    return data.channel?.name ?? null;
  } else {
    console.error("Error fetching channel info:", data.error);
    return null;
  }
}
