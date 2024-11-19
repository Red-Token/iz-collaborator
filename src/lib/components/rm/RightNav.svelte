<script>
  import Button from "@lib/components/Button.svelte"
  import TreeView from "@lib/components/rm/TreeView.svelte"

  let tree_data = [
    {
      name: "Group",
      selected: true,
      children: [
        {
          name: "Sub Group",
          children: [
            {
              name: "Item 1.1.1",
            },
            {
              name: "Item 1.1.2",
            },
          ],
        },
        {
          name: "Group",
        },
      ],
    },
    {
      name: "Item 2",
      children: [
        {
          name: "Item 2.1",
        },
        {
          name: "Item 2.2",
        },
      ],
    },
    {
      name: "Item 3",
    },
  ]

  function onClick() {
    tree_data.push({
      name: "Item 4",
    })

    tree_data = tree_data
  }
</script>

<div>
  Hello World2!
  <Button class="btn btn-primary" on:click={onClick}>HULU</Button>
  <TreeView {tree_data} let:item>
    <div class="group flex w-full border-b border-b-blue-700 py-2">
      {#if item.children}
        <div class="grow">
          📁 {item.name}
        </div>
      {:else}
        <div class="grow">
          📝 {item.name}
        </div>
      {/if}
    </div>
  </TreeView>
</div>
