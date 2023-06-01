import { Clock, Texture } from "three"
import { MinecraftTexture } from "./texture"

export type Frame = { index: number, time: number }
type FrameSequence = Frame[]

export type AnimationMeta = {
  animation: {
    interpolate?: boolean
    frametime?: number
    frames?: Array<number | Frame>
  }
}

const generateFrameSequence = (
  { frames, frametime: frameTime = 1 }: AnimationMeta["animation"],
  frameCount: number
): FrameSequence => {
  return (frames || Array.from({ length: frameCount }, (_, i) => ({ index: i, time: frameTime })))
    .map((frame: Frame | number) => typeof frame === "number" ? { index: frame, time: frameTime } : frame)
}

const MINECRAFT_TICK: number = 1000 / 20

// Adapted from https://github.com/MaciejWWojcik/three-plain-animator/blob/26c233428b7019fb3885df47ff0e07491809fb2c/src/plain-animator.ts
export class McMetaAnimator {
  protected currentFrameDisplayTime: number = 0
  protected currentFrame: number = 0
  protected clock: Clock = new Clock()
  protected frameDisplayDuration: number
  protected tilesTotalAmount: number

  protected framesSequence?: Frame[]
  protected currentSequenceIndex: number = 0

  /**
   * Create a PlainAnimator
   * @param {Texture} texture - THREE Texture object with sprite image loaded
   * @param {AnimationMeta} mcmeta - mcmeta object with animation data
   */
  constructor(
    public texture: MinecraftTexture,
    public mcmeta: AnimationMeta
  ) {
    const tileCount = texture.getTilesCount()
    this.tilesTotalAmount = tileCount - 1 // indexing from 0
    this.frameDisplayDuration = MINECRAFT_TICK // minecraft tick is 1/20 of a second
    this.framesSequence = generateFrameSequence(mcmeta?.animation ?? {}, tileCount)
    this.currentSequenceIndex = 0
  }

  /**
   * Initializes Animator,
   * @param {number} startFrame - optional parameter for setting the start position of animation (frame number)
   * @return {Texture} a Texture object that will display animation
   */
  public init(startFrame: number = 0): Texture {
    this.currentFrame = startFrame
    this.currentFrameDisplayTime = 0
    this.clock = new Clock()
    this.updateFrame()
    return this.texture
  }

  /**
   * Updates current frame in Texture, should be invoked in loop to allow updating the texture
   *
   * @example
   * function animate() {
   *    animator.animate()
   *    requestAnimationFrame(animate)
   *  }
   *
   */
  public animate(): void {
    this.currentFrameDisplayTime += this.clock.getDelta() * 1000

    while (this.currentFrameDisplayTime > this.frameDisplayDuration) {
      this.currentFrameDisplayTime -= this.frameDisplayDuration
      if (this.framesSequence) {
        const currentFrameData = this.framesSequence[this.currentSequenceIndex]
        this.currentFrame = currentFrameData.index
        this.frameDisplayDuration = currentFrameData.time * MINECRAFT_TICK
        this.currentSequenceIndex =
          (this.currentSequenceIndex + 1) % this.framesSequence.length
      } else {
        this.currentFrame =
          this.currentFrame < this.tilesTotalAmount ? this.currentFrame + 1 : 0
      }
      this.updateFrame()
    }
  }

  protected updateFrame() {
    this.texture.setTileIndex(this.currentFrame)
  }
}
