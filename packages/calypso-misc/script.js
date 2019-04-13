/**
 * Calypso - calypso-misc <https://github.com/msikma/calypso>
 * © MIT license
 */

import vm from 'vm'

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
export const findScriptData = (scriptContent) => {
  try {
    const sandbox = { window: {} }
    const script = new vm.Script(scriptContent)
    const ctx = new vm.createContext(sandbox) // eslint-disable-line new-cap
    const value = script.runInContext(ctx)
    return {
      value,
      sandbox
    }
  }
  catch (e) {
    throw new Error(`Could not extract script data: ${e}`)
  }
}
