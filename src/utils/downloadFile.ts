export function downloadFile(filename: string, url: string): Promise<void> {
  return new Promise((resolve) => {
    const element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.append(element);

    element.click();
    setTimeout(() => {
      element.remove();
      resolve();
    }, 0);
  });
}
