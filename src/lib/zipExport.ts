import JSZip from "jszip";
import { saveAs } from "file-saver";
import { APP_NAME, APP_VERSION, PROVIDERS } from "../config/appConfig";
import type { Conversation } from "../types/chat";
import type { Settings } from "../types/settings";

export async function exportBundle(params: {
  conversations: Conversation[];
  settings: Settings;
  mode: string;
}): Promise<void> {
  const zip = new JSZip();

  zip.file(
    "README.md",
    `# ${APP_NAME} — Export Bundle

Version: ${APP_VERSION}
Exported: ${new Date().toISOString()}

This archive contains your saved conversations, settings, and a manifest.

## Files

- \`conversations.json\` — all saved chat sessions
- \`settings.json\` — app settings (API key excluded for safety)
- \`manifest.json\` — export metadata

## Restore

Open ${APP_NAME} → Settings → Data and manually re-add your API key.
Conversations are stored under the same localStorage keys as the app uses.
`
  );

  zip.file(
    "conversations.json",
    JSON.stringify(params.conversations, null, 2)
  );

  zip.file(
    "settings.json",
    JSON.stringify(
      {
        ...params.settings,
        mode: params.mode,
      },
      null,
      2
    )
  );

  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        app: APP_NAME,
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        conversationCount: params.conversations.length,
        providers: Object.keys(PROVIDERS),
      },
      null,
      2
    )
  );

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `cyberx-export-${Date.now()}.zip`);
}