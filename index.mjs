import readline from "readline/promises";

const BASE_URL = "https://api.github.com/";
const TOKEN = process.env.GTOKEN;

if (TOKEN === undefined) {
  console.log(
    "Github token not found. Please set GTOKEN env variable and export it."
  );
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}` };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ORG = await rl.question("Enter org: ");

rl.close();

async function getOrgRepos() {
  const url = `${BASE_URL}orgs/${ORG}/repos?type=all&per_page=100`;
  let res = await fetch(url, {
    headers,
  });
  res = await res.json();
  return res;
}

async function getRepoContent(repo) {
  const url = `${BASE_URL}repos/${ORG}/${repo}/contents/CODEOWNERS`;
  let res = await fetch(url, {
    headers,
  });
  res = await res.json();
  return res;
}

try {
  const repos = await getOrgRepos("the-demo-org");

  for await (const repo of repos) {
    const repoName = repo.name;
    const repoURL = repo.url;
    let isFound = true;
    const res = await getRepoContent(repo.name);

    if (!res.content) {
      isFound = false;
    }

    const message = `
Repo: ${repoName}
URL: ${repoURL}
codeownders file found: ${isFound}
`;
    console.log(message);
  }
} catch (e) {
  console.log(e);
}
