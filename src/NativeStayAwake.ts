import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  setActivated(activated: boolean): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('StayAwake');
