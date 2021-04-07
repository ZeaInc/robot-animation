<script>
  import { Router } from '@roxi/routify'
  import { routes } from '../.routify/routes'
  import Serviceworker from './Serviceworker.svelte'
</script>

<Router {routes} />

<Serviceworker />

<style global>
  @import '../assets/global.css';

  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
