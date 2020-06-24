<script>
  import { User, signInWithGoogle } from "hasurafire";
  import { _goto } from "svelte-route";
</script>

<style>
  div {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  button {
    background: rgb(50, 173, 91);
    padding: 1rem 2rem;
    min-width: 200px;
    border: 0;
    color: white;
    font-size: 1.2rem;
    font-weight: 500;
    outline: gray;
    border-radius: 0.2rem;
  }
  button:hover {
    box-shadow: 2px 2px 5px #333;
  }
</style>

<div>
  <User on:in={_goto('/items', true)}>
    <h1 slot="pending">authenticating...</h1>
    <button slot="signed-out" on:click={signInWithGoogle}>
      Sign In With Google
    </button>
  </User>
</div>
