document.getElementById("new-todo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("new-todo-title").value;
  const response = await fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (response.ok) {
    location.reload();
  } else {
    alert("Failed to create todo.");
  }
});
