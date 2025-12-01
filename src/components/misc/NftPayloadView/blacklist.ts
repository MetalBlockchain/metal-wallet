export const URLBLacklist = [`avax-reward.su`];

/***
 * Checks if the given URL partially matches anything in the blacklist.
 * @param url
 */
export function isUrlBanned(url: string) {
  for (const urlPart of URLBLacklist) {
    if (!urlPart) continue;

    if (url.includes(urlPart)) {
      return true;
    }
  }
  return false;
}
