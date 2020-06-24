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
  <div class="container">
    <a href="/">Home</a>
    <div class="spacer">.</div>
    <User let:signout>
      <a href="/login" on:click={signout}>Logout</a>
      <a slot="pending" href="/login">...</a>
      <a slot="signed-out" href="/login">Login</a>
    </User>
  </div>
</nav>
