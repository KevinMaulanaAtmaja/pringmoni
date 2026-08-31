/**
 * Notifications Plugin
 * Sends cross-platform (Windows & macOS) notifications when sessions complete
 */

const isWindows = process.platform === "win32"

function windowsNotifyCommand(title: string, message: string): string {
  return (
    "Add-Type -AssemblyName System.Windows.Forms; " +
    "$n = New-Object System.Windows.Forms.NotifyIcon; " +
    "$n.Icon = [System.Drawing.SystemIcons]::Information; " +
    "$n.Visible = $true; " +
    `$n.ShowBalloonTip(0, '${title}', '${message}', 1); ` +
    "Start-Sleep -Seconds 4; " +
    "$n.Dispose()"
  )
}

const NotificationPlugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          if (isWindows) {
            await $`powershell -NoProfile -Command ${windowsNotifyCommand("OpenCode", "Session completed!")}`.quiet()
          } else {
            await $`osascript -e 'display notification "Session completed!" with title "OpenCode"'`.quiet()
          }
        } catch {
          // Ignore notification errors
        }
      }
    },
  }
}

export default NotificationPlugin
