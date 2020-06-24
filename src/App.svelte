<script>
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
</script>

<Pages alt={NotFound}>
  <Navbar />
  <Page route="/" src={Home} />
  <Page route="/login" src={Login} />
  <Page route="/settings" src={Settings} />
  <Page route="/item" src={Item} />
  <Page route="/items" src={Items} />
  <Page route="/diagram" src={Diagram} />
  <Page route="/editor" src={Editor} />
</Pages>
