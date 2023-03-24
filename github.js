const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  userAgent: 'github-todo-app',
});

async function listTodos(accessToken, repo) {
  const result = await octokit.issues.listForRepo({
    ...repo,
    state: 'open',
    // labels: 'todo',
    per_page: 100,
    page: 1,
    headers: {
      authorization: `token ${accessToken}`,
    },
  });
  return result.data;
}

async function listUserRepos(accessToken) {
  const { data } = await octokit.request('GET /user/repos', {
    per_page: 100,
    headers: {
      authorization: `token ${accessToken}`,
    },
  });

  return data.map(repo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
  }));
}

async function createTodo(accessToken, { owner, repo, title }) {
  const { data } = await octokit.request('POST /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    title,
  });

  return {
    id: data.id,
    title: data.title,
    url: data.html_url,
  };
}

module.exports = { listTodos, listUserRepos, createTodo };
