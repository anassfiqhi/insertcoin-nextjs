// Windows limits command lines to about 8k characters, and long OneDrive paths hit that quickly.
// Past a handful of files, run the tools on the whole project instead of passing every path.
const MAX_FILES = 20;

const quote = (files) => files.map((file) => JSON.stringify(file)).join(" ");

const perFileOr = (files, perFile, wholeProject) =>
  files.length > MAX_FILES ? wholeProject : perFile(quote(files));

export default {
  "*.{ts,tsx,mts,mjs}": (files) =>
    perFileOr(
      files,
      (list) => [`eslint --fix ${list}`, `prettier --write ${list}`],
      ["eslint --fix .", "prettier --write ."],
    ),
  "*.{json,css,md,yaml,yml}": (files) =>
    perFileOr(files, (list) => [`prettier --write ${list}`], [
      "prettier --write .",
    ]),
};
