//
// Created by ren7995 on 2021-12-16 16:52:56
// Copyright (c) 2021 ren7995. All rights reserved.
//

#import <UIKit/UIKit.h>
#include <objc/runtime.h>
#include <substrate.h>
#import <SpringBoard/SpringBoard.h>

#import "Discord.h"

static UIColor *messageCellLightColor;
static UIColor *messageCellDarkColor;
static UIColor *messageCellDynamicColor;
static float profile_radius = 12.0F;
static float chat_area_radius = 10.0F;

static BOOL isDiscordDarkMode() {
    CGFloat red = 0;
    [[objc_getClass("DCDThemeColor") BACKGROUND_PRIMARY] getRed:&red green:nil blue:nil alpha:nil];
    return red < 0.25;
}

static void loadDynamicColors() {
    messageCellLightColor = [UIColor colorWithRed:1.0 green:1.0 blue:1.0 alpha:0.4];
    messageCellDarkColor = [UIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.4];

    if(@available(iOS 13, *)) {
        messageCellDynamicColor = [[UIColor alloc] initWithDynamicProvider:^UIColor *(UITraitCollection *traitCollection) {
            return isDiscordDarkMode() ? messageCellDarkColor : messageCellLightColor;
        }];
    } else {
        messageCellDynamicColor = messageCellDarkColor;
    }
}

// Avatar view custom corner radius
%hook DCDAvatarView

- (void)layoutSubviews {
    %orig();
    self.layer.cornerRadius = profile_radius;
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event {
    [UIView animateWithDuration:0.3 animations:^{
        self.alpha = 0.5;
    } completion:^(BOOL finished) {
        [UIView animateWithDuration:0.3 animations:^{
            self.alpha = 1.0;
        }];
    }];
    
    %orig;
}

%end

// Message cell background (rounded)
%hook DCDMessageTableViewCell
%property (nonatomic, strong) UIView *customBackgroundView;

- (void)setBackgroundColor:(UIColor *)arg1 {
    %orig([UIColor clearColor]);
}

- (void)didMoveToSuperview {
    if(!self.customBackgroundView) {
        self.customBackgroundView = [[UIView alloc] init];
    }

    %orig();

    [self insertSubview:self.customBackgroundView atIndex:0];
    self.customBackgroundView.translatesAutoresizingMaskIntoConstraints = NO;
    self.customBackgroundView.layer.cornerRadius = chat_area_radius;
    self.customBackgroundView.layer.masksToBounds = NO;
    self.customBackgroundView.backgroundColor = messageCellDynamicColor;
    [NSLayoutConstraint activateConstraints:@[
        [self.customBackgroundView.heightAnchor constraintEqualToAnchor:self.innerView.heightAnchor],
        [self.customBackgroundView.widthAnchor constraintEqualToAnchor:self.innerView.widthAnchor constant:10.0F],
        [self.customBackgroundView.leadingAnchor constraintEqualToAnchor:self.innerView.leadingAnchor constant:-5.0F],
        [self.customBackgroundView.topAnchor constraintEqualToAnchor:self.innerView.topAnchor],
    ]];
}

%end

// Separator view background fix
%hook DCDSeparatorTableViewCell

- (void)setBackgroundColor:(UIColor *)arg1 {
    %orig([UIColor clearColor]);
}

%end

// Embed fix
%hook DCDEmbedView

- (void)didMoveToSuperview {
    %orig();
    self.subviews[0].backgroundColor = [UIColor clearColor];
}

%end

// Constructor
%ctor {
    @autoreleasepool {
        [[NSBundle mainBundle] load];
    }
    loadDynamicColors();
    %init();
}