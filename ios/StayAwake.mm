#import "StayAwake.h"

#if __has_include("StayAwake/StayAwake-Swift.h")
#import "StayAwake/StayAwake-Swift.h"
#else
#import "StayAwake-Swift.h"
#endif

// Thin ObjC++ shim: codegen'd TurboModule specs are C++/ObjC++, so this
// class only conforms to the spec and forwards to the Swift implementation.
@implementation StayAwake {
  StayAwakeImpl *_impl;
}

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [StayAwakeImpl new];
  }
  return self;
}

- (void)setActivated:(BOOL)activated
{
  [_impl setActivated:activated];
}

- (void)invalidate
{
  // Don't leave the idle timer disabled across reloads.
  [_impl setActivated:NO];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeStayAwakeSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"StayAwake";
}

@end
