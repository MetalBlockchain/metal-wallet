export const URLBLacklist = [`avax-reward.su`];

/***
 * Checks if the given URL partially matches anything in the blacklist.
 * @param url
 */
export function isUrlBanned(url: string) {
  for (let i = 0; i < URLBLacklist.length; i++) {
    const urlPart = URLBLacklist[i];
    if (!urlPart) continue;

    if (url.includes(urlPart)) {
      return true;
    }
  }
  return false;
}
