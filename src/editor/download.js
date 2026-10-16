/**
 * Saves text as a file. Nothing is uploaded: the file is built in the browser.
 *
 * @param {string} filename
 * @param {string} text
 */
export function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Free the memory once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
