// Sends login/register requests; the server replies with a session cookie
async function send(path) {
  const res = await fetch("/api/auth/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  });
  const data = await res.json();
  if (res.ok) {
    window.location.href = "index.html";
  } else {
    document.getElementById("message").textContent = data.error;
  }
}

document.getElementById("login").addEventListener("click", () => send("login"));
document.getElementById("register").addEventListener("click", () => send("register"));