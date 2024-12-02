<div class="flex items-center gap-2 p-2 text-xs uppercase opacity-50">
  <div class="bg-base-content h-px flex-grow opacity-25" />
  {#if $$slots.default}
    <p><slot /></p>
    <div class="bg-base-content h-px flex-grow opacity-25" />
  {/if}
</div>
