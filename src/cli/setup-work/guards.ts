import { Preset } from './types';

export function assertPreset<P extends Preset<PresetType, any> = Preset<PresetType, any>>(
  preset: any,
  type?: PresetType,
): asserts preset is P {
  if (!type) {
    if (!preset.type) {
      throw new Error('Preset is not selected.');
    } else {
      return;
    }
  }

  if (preset.type !== type) {
    throw new Error('Incorrect preset state.');
  }
}
