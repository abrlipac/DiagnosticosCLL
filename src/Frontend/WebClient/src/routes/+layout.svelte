<script>
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
</script>

<Navbar />
<div class="container" style="min-height: calc(100vh - 3.5rem - 1px)">
	<slot></slot>
</div>
<Footer />