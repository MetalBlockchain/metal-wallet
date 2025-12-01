// Extending Big.js with a helper function
import Big from "big.js";

// Adding toLocaleString method for big.js
declare module "big.js" {
  interface Big {
    toLocaleString(toFixed?: number): string;
  }
}

Big.prototype.toLocaleString = function (toFixed = 9) {
  const fixedStr = this.toFixed(toFixed);
  const split = fixedStr.split(".");
  const wholeStr = Number.parseInt(split[0]).toLocaleString("en-US");

  if (split.length === 1) {
    return wholeStr;
  } else {
    let remainderStr = split[1];

    // remove trailing 0s
    let lastChar = remainderStr.charAt(remainderStr.length - 1);
    while (lastChar === "0") {
      remainderStr = remainderStr.slice(0, Math.max(0, remainderStr.length - 1));
      lastChar = remainderStr.charAt(remainderStr.length - 1);
    }

    const trimmed = remainderStr.slice(0, Math.max(0, toFixed));
    if (!trimmed) return wholeStr;
    return `${wholeStr}.${trimmed}`;
  }
};
