// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const vm = require('vm')

// Provides 'window' by default to be more compatible with common <script> contents.
const DEFAULT_SANDBOX = { window: {} }

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
const extractScriptResult = (scriptContent, sandbox = DEFAULT_SANDBOX) => {
  try {
    const sandbox = { window: {} }
    const script = new vm.Script(scriptContent)
    const ctx = new vm.createContext(sandbox)
    const value = script.runInContext(ctx)
    return {
      success: true,
      error: null,
      value,
      sandbox
    }
  }
  catch (err) {
    return {
      success: false,
      error: err
    }
  }
}

module.exports = {
  extractScriptResult
}
