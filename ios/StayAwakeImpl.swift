import UIKit

/**
 * All real iOS logic lives here in Swift. The ObjC++ shim in StayAwake.mm
 * only exists to satisfy the codegen'd TurboModule spec and forwards to
 * this class.
 */
@objc(StayAwakeImpl)
public class StayAwakeImpl: NSObject {
  @objc public func setActivated(_ activated: Bool) {
    DispatchQueue.main.async {
      UIApplication.shared.isIdleTimerDisabled = activated
    }
  }
}
