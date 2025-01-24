# Slack Message Exporter

Slack Message Exporter is a tool for exporting Slack messages into HTML or CSV formats.  
It organizes message content, user information, and attachments.


## Features

- **Export Slack Messages**:
  - Save as HTML for easy viewing in a browser.
  - Save as CSV for data analysis in spreadsheet software.
- **Save Attachments**:
  - Download images, videos, and other files to a local directory.
- **HTML with Table of Contents**:
  - Automatically generates a yearly table of contents, allowing quick navigation to specific years.

## Environment

Slack Message Exporter works in the following environment:

- **Deno**: `2.1.6 (stable, release, aarch64-apple-darwin)`
- **V8**: `13.0.245.12-rusty`
- **TypeScript**: `5.6.2`


## Installation

1. Create a Slack API App:

    Go to the [Slack API](https://api.slack.com/apps) page and click "Create New App."
    Choose "From scratch," enter your app name, and select the workspace, then click "Create App."

2. Set Up OAuth & Permissions:

    In the left-hand menu, select "OAuth & Permissions."
    Under the Scopes section, add the following scopes to "Bot Token Scopes":
        - `channels:history`
        - `files:read`
        - `users:read`
        - `channels:read`
        - `team:read`
    Click "Install App to Workspace" and authorize the app.
    Copy the "OAuth Access Token" and set it as SLACK_BOT_TOKEN in your .env file.

3. Get the Channel ID:

    Open the Slack workspace and navigate to the channel you want to export messages from.
    Copy the ID at the end of the channel URL (e.g., C12345678).
    Set this ID as SLACK_CHANNEL_ID in your .env file or input it during the wizard execution.

4. Invite the Bot to the Target Channel:

    Go to the target channel you want to export messages from.
    Use the following command to invite the bot to the channel:
     ```plaintext
     /invite @your-bot-name
     ```
    Confirm that the bot has successfully joined the channel.

5. **Clone the repository**:

```bash
git clone https://github.com/uruly/SlackMessageExporter
cd SlackMessageExporter
```

6. Create a .env file: Set up the environment variables by creating a .env file with the following content:

```
# Slack Bot Token
SLACK_BOT_TOKEN=your-slack-bot-token

# Slack Channel ID
SLACK_CHANNEL_ID=your-channel-id
```


## Usage

1. Run the export script:
```bash
deno run --env --allow-net --allow-write --allow-read --allow-env index.ts
```

2. Output:
Files are saved in the outputs/ directory.


## Reference

https://api.slack.com/apis/conversations-api

## Notes on API Usage

This project integrates with the Slack API to export messages. Users of this project must comply with the [Slack Developer Policy](https://api.slack.com/terms).

### Requirements:

1. You must obtain a valid Slack API token from your workspace.
2. Ensure that you do not exceed Slack's API rate limits.
3. Do not share your API tokens publicly or include them in the project repository.
4. **Remember to add the bot not only to the workspace but also to the target channels**.
   - Use the following command to invite the bot to the channel:
     ```plaintext
     /invite @your-bot-name
     ```


## License

This project is licensed under the MIT License.