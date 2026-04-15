export interface IWaveState {
    enterWave(): void;
    processInput(key: string): void;
    update(dt: number): void;
    handleTargetSkip(): void;
}
