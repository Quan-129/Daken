import { EventBus } from '../../../core/EventBus';
import { IWaveState } from './IWaveState';

export abstract class BaseWaveState implements IWaveState {
    constructor(protected context: any) {}

    abstract enterWave(): void;
    abstract processInput(key: string): void;
    
    update(_dt: number): void {
        // Optional default implementation
    }

    abstract handleTargetSkip(): void;

    protected publishTypingUpdate(buffer: string, prefix: string = "") {
        EventBus.getInstance().publish('TYPING_UPDATED', { buffer, prefix: prefix || buffer });
    }

    protected playBuzz() {
        EventBus.getInstance().publish('PLAY_BUZZ', null);
    }
}
