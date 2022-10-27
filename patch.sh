#!/bin/bash
# enmity patch remake by rosie <3333

# global variables used >>>
IPA_DIR=ipas/Discord.ipa

### enmity patching :)
## output directory of patched ipa
mkdir -p dist/
rm -rf dist/*

# # patch the ipa with the dylib tweak (using azule)
# [[ -d "Azule" ]] && echo "[*] Azule already exists" || git clone https://github.com/Al4ise/Azule &
# wait $!

Azule/azule -i $IPA_DIR -o dist -f EnmityPatches/enmity.dev.deb &
wait $!

mv dist/Discord+enmity.dev.deb.ipa dist/Enmity.ipa

# remove payload incase it exists
rm -rf Payload

## unzip the ipa and wait for it to finish unzipping
unzip dist/Enmity.ipa &
wait $!

# set the main path to the payload plist in a variable for ease of use
MAIN_PLIST=Payload/Discord.app/Info.plist

# patch discord's name
plutil -replace CFBundleName -string "Enmity" $MAIN_PLIST
plutil -replace CFBundleDisplayName -string "Enmity" $MAIN_PLIST

# patch discord's url scheme to add enmity's url handler
plutil -insert CFBundleURLTypes.1 -xml "<dict><key>CFBundleURLName</key><string>Enmity</string><key>CFBundleURLSchemes</key><array><string>enmity</string></array></dict>" $MAIN_PLIST

# remove discord's device limits
plutil -remove UISupportedDevices $MAIN_PLIST

# patch the icons
cp -rf Icons/* Payload/Discord.app/ 
plutil -replace CFBundleIcons -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" $MAIN_PLIST
plutil -replace CFBundleIcons~ipad -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string><string>EnmityIcon76x76</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" $MAIN_PLIST

# patch itunes and files
plutil -replace UISupportsDocumentBrowser -bool true $MAIN_PLIST
plutil -replace UIFileSharingEnabled -bool true $MAIN_PLIST

## plumpycord and rosiecord patching AYAYA ##

# copy the images and fonts over
cp -rf Packs/Plumpy/* Payload/Discord.app/assets/
cp -rf Fonts/* Payload/Discord.app/

# pack the ipa into rosiecord and remove the payload and ipa
zip -r dist/Rosiecord.ipa Payload
rm -rf dist/Enmity.ipa
rm -rf Payload

