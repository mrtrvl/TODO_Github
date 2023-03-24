const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  userAgent: 'github-todo-app',
});

module.exports = {
  listTodos: async function (accessToken, repo) {
    const result = await octokit.issues.listForRepo({
      ...repo,
      state: 'open',
      labels: 'todo',
      per_page: 100,
      headers: {
        authorization: `token ${accessToken}`,
      },
    });
    return result.data;
  },

  // Add other functions for creating, updating, and deleting todos
};
