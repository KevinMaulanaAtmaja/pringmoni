/**
 * Verification Plugin
 * Suggests running tests after significant code changes
 */

let editedFiles: string[] = []
let lastSuggestion = 0

const VerificationPlugin = async ({}) => {
  return {
    event: async ({ event }) => {
      if (event.type === "file.edited") {
        const filePath = (event as any).path || ""
        if (filePath && !filePath.includes("node_modules")) {
          editedFiles.push(filePath)
        }

        const now = Date.now()
        if (editedFiles.length >= 3 && now - lastSuggestion > 60000) {
          lastSuggestion = now
          console.log(`[verification] ${editedFiles.length} files edited. Consider running tests.`)
          editedFiles = []
        }
      }
    },
  }
}

export default VerificationPlugin
