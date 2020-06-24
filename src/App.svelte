<script>
  import { Root } from "hasurafire";
  import { Pages, Page } from "svelte-route";

  import Navbar from "./components/Navbar.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import Home from "./pages/Home.svelte";
  import Login from "./pages/Login.svelte";
  import Settings from "./pages/Settings.svelte";
  import Item from "./pages/Item.svelte";
  import Items from "./pages/Items.svelte";
  import Diagram from "./pages/Diagram.svelte";
  import Editor from "./pages/Editor.svelte";

  import config from "../config";
</script>

<style>
  :global(.container) {
    max-width: 1300px;
    margin: 0 auto;
  }
  /* h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  } */
</style>

<Root {...config}>
  <Pages alt={NotFound}>
    <Navbar />
    <div class="container">
      <Page route="/" src={Home} />
      <Page route="/login" src={Login} />
      <Page route="/settings" src={Settings} />
    </div>
    <Page route="/item" src={Item} />
    <Page route="/items" src={Items} />
    <Page route="/diagram" src={Diagram} />
    <Page route="/editor" src={Editor} />
  </Pages>
</Root>
