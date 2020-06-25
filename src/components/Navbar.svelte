<script>
  import { User } from "hasurafire";
</script>

<style>
  nav {
    background: #333;
  }
  .container {
    margin: 0 auto;
    height: 60px;
    display: flex;
  }
  .container {
    max-width: 1300px;
  }
  .container > a {
    color: white;
    text-decoration: none;
    display: flex;
    padding: 0 1rem;
    align-items: center;
    justify-content: center;
  }
  .container > a:hover {
    background: #ffffff22;
  }
  div.spacer {
    width: 100%;
  }
</style>

<nav>
  <User let:signout>

    <div class="container">
      <a href="/">Dashboard</a>
      <div class="spacer">.</div>
      <a href="/login" on:click={signout}>Logout</a>
    </div>

    <div slot="pending" class="container">
      <a href="/">Home</a>
      <div class="spacer">.</div>
      <a href="/login">...</a>
    </div>

    <div slot="signed-out" class="container">
      <a href="/">Home</a>
      <div class="spacer">.</div>
      <a href="/login">Login</a>
    </div>

  </User>
</nav>
