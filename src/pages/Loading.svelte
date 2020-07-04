<script>
  export let context = undefined;
  export let hashid = undefined;
</script>

<h1>loading{#if hashid}&nbsp;hashid{/if}...</h1>

{#if context}
  <p>Route: {context.path}</p>
{/if}
