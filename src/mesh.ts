import { Mesh, FileLoader } from 'three'

import { MinecraftModelGeometry } from './geometry'
import { AbstractLoader, OnLoad, OnProgress, OnError } from './loader'
import { MinecraftModelMaterial } from './material'
import { MinecraftModel, isMinecraftModel } from './model'
import { MISSING_TEXTURE, MinecraftTexture } from './texture'
import { AnimationMeta, McMetaAnimator } from './animator'

type MaterialMapping = { [path: string]: MinecraftModelMaterial }

export type ResolvedTexture = { texture: MinecraftTexture, mcmeta?: AnimationMeta }

export class MinecraftModelMesh extends Mesh {
  public model: MinecraftModel
  
  private materialMapping: MaterialMapping
  private textureAnimations: Record<string, McMetaAnimator>

  constructor (model: MinecraftModel | string | any) {
    if (typeof model === 'string') {
      model = JSON.parse(model)
    }

    if (!isMinecraftModel(model)) {
      throw new Error('Invalid model')
    }

    const geometry = new MinecraftModelGeometry(model)

    const sortedTextures = [...new Set(Object.values(model.textures))].sort()
    const mapping: MaterialMapping = {}
    const materials = sortedTextures
      .map(path => mapping[path] = new MinecraftModelMaterial())

    super(geometry, [new MinecraftModelMaterial(), ...materials])

    this.materialMapping = mapping
    this.model = model
    this.textureAnimations = {}
  }

  public resolveTextures (resolver: (path: string) => ResolvedTexture | undefined) {
    for (const path in this.materialMapping) {
      const { texture = MISSING_TEXTURE, mcmeta } = resolver(path) ?? {}

      const isAnimated = texture.isAnimated()

      // if the texture is not animated or there is no mcmeta, use the texture as is
      if (!isAnimated || !mcmeta) {
        this.materialMapping[path].map = texture
        continue
      }

      const animator = new McMetaAnimator(texture, mcmeta)
      const animatedTexture = animator.init()

      this.materialMapping[path].map = animatedTexture
      this.textureAnimations[path] = animator
    }
  }

  public animate () {
    for (const path in this.textureAnimations) {
      this.textureAnimations[path].animate()
    }
  }
}

export class MinecraftModelLoader extends AbstractLoader<MinecraftModelMesh> {
  public load (url: string, onLoad?: OnLoad<MinecraftModelMesh>, onProgress?: OnProgress, onError?: OnError) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setResponseType('json')

    const handleLoad = (model: any) => {
      try {
        const mesh = new MinecraftModelMesh(model)

        if (onLoad) {
          onLoad(mesh)
        }
      } catch (err) {
        if (onError) {
          onError(err)
        }
      }
    }

    loader.load(url, handleLoad, onProgress, onError)
  }
}
