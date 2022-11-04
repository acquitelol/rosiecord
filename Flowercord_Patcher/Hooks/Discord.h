//
// Created by ren7995 on 2021-12-16 16:54:23
// Copyright (c) 2021 ren7995. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface DCDAvatarView : UIView
@end

@interface DCDChat : UIView
@property (nonatomic, strong) UIImageView *customBackground;
- (void)_updateDynamicBackgroundImage;
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
@end
