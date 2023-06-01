import { NearestFilter, Texture, ImageLoader, RepeatWrapping, SRGBColorSpace } from 'three'

import { AbstractLoader, OnProgress, OnError, OnLoad } from './loader'

const CHECKERBOARD_IMAGE = new ImageLoader().load(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4goSFSEEtucn/QAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAkSURBVCjPY2TAAX4w/MAqzsRAIhjVQAxgxBXeHAwco6FEPw0A+iAED8NWwMQAAAAASUVORK5CYII="
)

export class MinecraftTexture extends Texture {
  private tileIdx: number = 0
  private tilesCount: number = 1

  constructor (image: HTMLImageElement = CHECKERBOARD_IMAGE) {
    super(image)

    this.colorSpace = SRGBColorSpace
    this.magFilter = NearestFilter
    this.minFilter = NearestFilter
  }

  set(image: HTMLImageElement) {
    this.image = image

    const tilesCount = image.height / image.width
    if (tilesCount > 1) {
      // set the texture to repeat
      this.wrapS = RepeatWrapping
      this.wrapT = RepeatWrapping

      this.repeat.set(1, 1 / tilesCount)
    }

    this.tilesCount = tilesCount
    this.tileIdx = 0

    this.needsUpdate = true
  }

  getTilesCount() {
    return this.tilesCount
  }

  isAnimated() {
    return this.tilesCount > 1
  }

  setTileIndex(index: number) {
    this.tileIdx = index % this.tilesCount
    this.offset.y = this.tileIdx / this.tilesCount
  }
}

export const MISSING_TEXTURE = new MinecraftTexture()

export class MinecraftTextureLoader extends AbstractLoader<MinecraftTexture> {
  public crossOrigin = 'anonymous'

  public load (url: string, onLoad?: OnLoad<MinecraftTexture>, onProgress?: OnProgress, onError?: OnError) {
    const texture = new MinecraftTexture()

    const loader = new ImageLoader(this.manager)
    loader.setCrossOrigin(this.crossOrigin)
    loader.setPath(this.path)

    const handleLoad = (image: HTMLImageElement) => {
      if (!this.hasValidDimensions(image)) {
        throw new Error(`Invalid image dimensions: ${image.height}x${image.width}`)
      }

      texture.set(image)

      if (onLoad) {
        onLoad(texture)
      }
    }

    loader.load(url, handleLoad, onProgress, onError)
  }

  public setCrossOrigin (value: string) {
    this.crossOrigin = value
    return this
  }

  private hasValidDimensions (image: HTMLImageElement) {
    // check if image is tiled (height is a multiple of width)
    return image.height % image.width === 0 && Math.log2(image.width) % 1 === 0
  }
}
