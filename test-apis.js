const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes("node_modules")) filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith(".ts") || dirFile.endsWith(".tsx")) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const apiPath = path.join("client", "src", "Api", "index.ts");
const code = fs.readFileSync(apiPath, "utf8");
const exportsArr = [...code.matchAll(/export\s+const\s+([a-zA-Z0-9_]+)\s*=/g)].map(m => m[1]);

const files = walkSync(path.join("client", "src")).filter(f => !f.endsWith("Api\\\\index.ts") && !f.endsWith("Api/index.ts") && !f.endsWith("index.ts"));
const fileContents = files.map(f => fs.readFileSync(f, "utf8"));

const unused = [];
exportsArr.forEach(exp => {
  let found = false;
  const regex = new RegExp("\\\\b" + exp + "\\\\b");
  for (const content of fileContents) {
    if (regex.test(content)) {
        found = true;
        break;
    }
  }
  if (!found) unused.push(exp);
});

console.log(JSON.stringify(unused, null, 2));
