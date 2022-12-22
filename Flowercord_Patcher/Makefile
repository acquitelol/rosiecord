ARCHS = armv7 arm64 arm64e
TARGET := iphone:clang:latest:14.0
INSTALL_TARGET_PROCESSES = Discord
FINALPACKAGE = 1

include ~/theos/makefiles/common.mk

TWEAK_NAME = FlowerCord

FlowerCord_FILES = $(wildcard Hooks/*.m) $(wildcard Hooks/*.xm)
FlowerCord_CFLAGS = -fobjc-arc

include ~/theos/makefiles/tweak.mk
