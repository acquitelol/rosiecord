//
// Created by ren7995 on 2021-12-16 16:54:23
// Modified by Rosie<3 on 2023-04-28 22:46:12
// Copyright (c) 2021 ren7995. All rights reserved.
//

#import <UIKit/UIKit.h>
#define NSLog(fmt, ... ) NSLog((@"[Flowercord] " fmt), ##__VA_ARGS__);

@interface DCDAvatarView : UIView
@end

@interface DCDMessageTableViewCell : UIView
@property (nonatomic, strong) UIView *customBackgroundView;
@property (nonatomic, strong) UIView *innerView;
@end

@interface DCDEmbedView : UIView
@end

@interface DCDAttachmentView : UIView
@end

@interface DCDThemeColor : NSObject
+ (UIColor *)BACKGROUND_PRIMARY;
+ (UIColor *)TEXT_MUTED;
@end
