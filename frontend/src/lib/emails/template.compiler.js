/**
 * Native Email Template Compiler
 * Replaces {{variable_name}} in HTML strings with actual data from a payload object.
 */
export const compileTemplate = (htmlString, payloadData) => {
  if (!htmlString) return '';
  
  // Use Regex to find all instances of {{ key }} and replace them with payloadData[key]
  return htmlString.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    // If the variable exists in the payload, inject it. Otherwise, leave it blank to prevent "undefined" printing in the email.
    return payloadData[key] !== undefined ? payloadData[key] : '';
  });
};