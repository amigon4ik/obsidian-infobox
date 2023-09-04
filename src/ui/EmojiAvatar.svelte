<script lang="ts">
    import type {Gender} from "../parser";

    export let age: number = -1;
    export let gender: Gender = null;
</script>

{#if gender === 'male'}
    {#if age >= 60}
        👴
    {:else if age >= 18 || age < 0}
        👨
    {:else if age > 2}
        👦
    {:else}
        👶
    {/if}
{:else if gender === 'female'}
    {#if age >= 60}
        👵
    {:else if age >= 18 || age < 0}
        👩
    {:else if age > 2}
        👧
    {:else}
        👶
    {/if}
{:else}
    {#if age >= 60}
        🧓
    {:else if age >= 18 || age < 0}
        🧑
    {:else if age > 2}
        🧒
    {:else}
        👶
    {/if}
{/if}
