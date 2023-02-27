const execa = require("execa");
const fs = require("fs");

(async () => {
  try {
    // checking whether there are some uncommitted changes before checkout new orphan branch
    // await execa("git", ["update-index", "--refresh"]);
    const { stdout } = await execa("git", ["diff-index", "HEAD"]);
    if (stdout) {
      console.log("Please stash or commit changes first!");
      process.exit(1);
    }
    await execa("git", ["checkout", "--orphan", "gh-pages"]);
    console.log("Building...");
    await execa("npm", ["run", "build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";
    await execa("git", ["--work-tree", folderName, "add", "--all"]);
    await execa("git", ["--work-tree", folderName, "commit", "-m", "gh-pages"]);
    console.log("Pushing to gh-pages...");
    await execa("git", ["push", "origin", "HEAD:gh-pages", "--force"]);
    await execa("rm", ["-r", folderName]);
    console.log("Successfully deployed");
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  } finally {
    //so that we always end up back on master
    await execa("git", ["checkout", "-f", "main"]);
    await execa("git", ["branch", "-D", "gh-pages"]);
  }
})();
