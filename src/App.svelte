<script>
  import { Root, loginStatus } from "hasurafire";
  import { Pages, Page } from "svelte-route";

  import Navbar from "./components/Navbar.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import Loading from "./pages/Loading.svelte";
  import Home from "./pages/Home.svelte";
  import Login from "./pages/Login.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
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
</style>

<Root {...config}>
  <Pages alt={NotFound}>
    <Navbar />
    <div class="container">
      <Page
        route="/"
        guard={[$loginStatus > -1]}
        src={$loginStatus === 0 ? Loading : Dashboard}
        alt={Home} />
      <Page route="/login" guard={$loginStatus} src={Login} alt={Loading} />
      <Page
        route="/settings"
        src={$loginStatus === 0 ? Loading : $loginStatus === 1 ? Settings : NotFound} />
    </div>
    <Page
      route="/items/:hashid"
      guard={[$loginStatus > -1]}
      src={$loginStatus ? Item : Loading}
      alt={NotFound} />
    <Page route="/items" src={$loginStatus ? Items : NotFound} />
    <Page route="/diagram" src={Diagram} />
    <Page route="/editor" src={Editor} />
  </Pages>
</Root>
