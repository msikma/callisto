Calypso - callisto-task-vgmrips
===============================

Scrapes VGMRips for new results.

## Generating the system list

Go to [the VGMRips systems page](https://vgmrips.net/packs/systems) and execute the following code:

```js
var systemData = {}
$('#systems > .system').map((n, sys) => {
  const nameAnchor = sys.querySelector('.name a')
  const name = nameAnchor.text.trim()
  const image = sys.querySelector('.pic img')
  systemData[name] = { image: image ? image.getAttribute('src') : null }
});
console.log(JSON.stringify(systemData, null, 2))
```

The result should be saved in `./task/systems.js`.
