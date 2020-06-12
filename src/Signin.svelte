<script>
  import { signInWithGoogle } from "hasurafire";
</script>

<style>
  button {
    min-width: 200px;
    padding: 1rem;
    border: 0;
    border-radius: 0.4rem;
    font-size: 1.1rem;
    font-weight: 600;
    font-family: sans-serif;
    background: #25ac37;
    color: white;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  button:hover {
    opacity: 0.9;
  }
</style>

<div>
  <button on:click={signInWithGoogle}>Signin with Google</button>
</div>
