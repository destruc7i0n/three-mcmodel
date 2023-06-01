# three-mcmodel

> A library for working with Minecraft json models using three.js.

**🚧 Work in progress, not stable yet 🚧**

```js
import { MinecraftModelLoader, MinecraftTextureLoader } from 'three-mcmodel'

new MinecraftModelLoader().load('model.json', mesh => {
  const textureLoader = new MinecraftTextureLoader()
  mesh.resolveTextures(path => ({ texture: textureLoader.load(`${path}.png`)/*, mcmeta: { animation: {...} }*/ }))
  scene.add(mesh)
})
```
