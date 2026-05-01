const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const GUILD_ID = '1491190522675728484'
const COLLABS_CHANNEL_NAME = 'collabs'

const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  'Content-Type': 'application/json',
}

// Get or create the #collabs channel
async function getOrCreateCollabsChannel(): Promise<string | null> {
  if (!BOT_TOKEN) return null

  try {
    // List existing channels
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
      headers,
    })
    if (!res.ok) {
      console.error('[Discord] Failed to list channels:', await res.text())
      return null
    }

    const channels = await res.json()
    const existing = channels.find(
      (c: any) => c.name === COLLABS_CHANNEL_NAME && c.type === 0
    )
    if (existing) return existing.id

    // Create it if it doesn't exist
    const createRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: COLLABS_CHANNEL_NAME,
        type: 0, // text channel
        topic: '🎵 CollabVault — new collab posts and accepted requests will appear here.',
        permission_overwrites: [], // inherits server defaults
      }),
    })

    if (!createRes.ok) {
      console.error('[Discord] Failed to create channel:', await createRes.text())
      return null
    }

    const newChannel = await createRes.json()
    console.log('[Discord] Created #collabs channel:', newChannel.id)
    return newChannel.id
  } catch (err) {
    console.error('[Discord] Error getting/creating channel:', err)
    return null
  }
}

// Post a message to #collabs
export async function postToCollabsChannel(embed: {
  title: string
  description: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  url?: string
}) {
  if (!BOT_TOKEN) {
    console.log('[Discord] No bot token configured, skipping')
    return
  }

  const channelId = await getOrCreateCollabsChannel()
  if (!channelId) return

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        embeds: [
          {
            color: embed.color ?? 0x8b5cf6, // purple default
            title: embed.title,
            description: embed.description,
            fields: embed.fields ?? [],
            url: embed.url,
            footer: { text: 'CollabVault' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    if (!res.ok) {
      console.error('[Discord] Failed to post message:', await res.text())
    }
  } catch (err) {
    console.error('[Discord] Error posting to channel:', err)
  }
}

// Send a DM to a Discord user (kept for other uses)
export async function sendDiscordDM(discordHandle: string, message: string) {
  if (!BOT_TOKEN) {
    console.log('[Discord] No bot token configured, skipping DM')
    return
  }

  try {
    const searchRes = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipient_id: discordHandle }),
    })

    if (!searchRes.ok) {
      console.error('[Discord] Failed to open DM channel:', await searchRes.text())
      return
    }

    const dmChannel = await searchRes.json()

    await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: message }),
    })
  } catch (err) {
    console.error('[Discord] Error sending DM:', err)
  }
}
