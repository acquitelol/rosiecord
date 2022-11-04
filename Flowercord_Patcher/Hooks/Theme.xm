//
// Created by ren7995 on 2021-12-16 16:52:56
// Copyright (c) 2021 ren7995. All rights reserved.
//

#import <UIKit/UIKit.h>
#include <objc/runtime.h>
#include <substrate.h>

#import "Discord.h"

static UIImage *lightImage;
static UIImage *darkImage;
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

static void loadBackgroundImages() {
    // Trolled
    NSFileManager *fm = [NSFileManager defaultManager];
    NSString *documentsDir = [[[[fm URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject] path] stringByAppendingString:@"/catcord/"];

    if(![fm fileExistsAtPath:documentsDir]) {
        [fm createDirectoryAtPath:documentsDir withIntermediateDirectories:NO attributes:nil error:nil];
    }

    NSString *lightImageDataPath = [documentsDir stringByAppendingString:@"light.png"];
    NSString *darkImageDataPath = [documentsDir stringByAppendingString:@"dark.png"];
    
    NSData *lightImageData = [NSData dataWithContentsOfFile:lightImageDataPath];
    NSData *darkImageData = [NSData dataWithContentsOfFile:darkImageDataPath];
    
    if(!lightImageData || !darkImageData) {
        lightImageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:@"https://cdn.discordapp.com/attachments/951560221401161758/1017578856196096111/unknown.png"]];
        darkImageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:@"https://cdn.discordapp.com/attachments/813858241502511104/921212603722780722/IMG_1822.PNG"]];
        //@"https://cdn.discordapp.com/attachments/813858241502511104/921174988801843220/image0.jpg"
        //@"https://media.discordapp.net/attachments/1014901536071094312/1017568750070931487/0FE4DC0D-9E77-4EFC-9DD6-8788E449F994.jpg"
        //@"https://media.discordapp.net/attachments/836793351818706984/979528510785867836/image0.jpg"
        
        [lightImageData writeToFile:lightImageDataPath atomically:YES];
        [darkImageData writeToFile:darkImageDataPath atomically:YES];
    }

    lightImage = [[UIImage alloc] initWithData:lightImageData];
    darkImage = [[UIImage alloc] initWithData:darkImageData];
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

    NSArray *subviews = self.subviews;
    
    for(UIView *view in subviews){
        NSString* myString = [NSString stringWithFormat:@"%ld",(long)view.tag];
        NSLog(@"ACQU_TAG: %@", myString);
    }
}

%end

// Chat wallpaper/background image view
%hook DCDChat
%property (nonatomic, strong) UIImageView *customBackground;

- (void)didMoveToSuperview {
    %orig();

    if(!self.customBackground) {
        self.customBackground = [[UIImageView alloc] initWithImage:nil];
    }

    [self _updateDynamicBackgroundImage];

    [self insertSubview:self.customBackground atIndex:0];
    self.customBackground.translatesAutoresizingMaskIntoConstraints = NO;
    [NSLayoutConstraint activateConstraints:@[
        [self.customBackground.heightAnchor constraintEqualToAnchor:self.heightAnchor],
        [self.customBackground.widthAnchor constraintEqualToAnchor:self.widthAnchor],
        [self.customBackground.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
        [self.customBackground.centerYAnchor constraintEqualToAnchor:self.centerYAnchor],
    ]];

    self.subviews[1].backgroundColor = [UIColor clearColor];
}

- (void)traitCollectionDidChange:(UITraitCollection *)traitCollection {
    %orig();
    [self _updateDynamicBackgroundImage];
}

%new
- (void)_updateDynamicBackgroundImage {
    if(!self.customBackground) return;
        [self.customBackground setImage:isDiscordDarkMode() ? darkImage : lightImage];
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
    self.customBackgroundView.layer.masksToBounds = YES;
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
    loadBackgroundImages();
    loadDynamicColors();
    %init();
}