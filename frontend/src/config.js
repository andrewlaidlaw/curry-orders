// Fetch config variables defined in window.*
const envSettings = window;

export const configuration = {
  orderapiurl: envSettings.ORDERAPIURL,
  menuapiurl: envSettings.MENUAPIURL
}