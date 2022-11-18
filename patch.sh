#!/bin/bash
# enmity patch remake by rosie <3333

# global variables used >>>
IPA_NAME=Discord_154
IPA_DIR=Ipas/$IPA_NAME.ipa

### enmity patching :)
## output directory of patched ipa
mkdir -p Dist/
rm -rf Dist/*


# remove payload incase it exists
rm -rf Payload

echo "[*] Directory of IPA: $IPA_DIR"


## unzip the ipa and wait for it to finish unzipping
unzip $IPA_DIR &
wait $!

# set the main path to the payload plist in a variable for ease of use
MAIN_PLIST=Payload/Discord.app/Info.plist

# patch discord's name
plutil -replace CFBundleName -string "Rosiecord" $MAIN_PLIST
plutil -replace CFBundleDisplayName -string "Rosiecord" $MAIN_PLIST

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

zip -r dist/Rosiecord_No_Font.ipa Payload

# change the font
cp -rf Fonts/* Payload/Discord.app/

# pack the ipa into rosiecord and remove the payload and ipa
zip -r dist/Rosiecord_Base.ipa Payload
rm -rf Payload

# make the flowercord package

# remove dir contents incase it exists
rm -rf Flowercord_Patcher/packages/*

# package the deb
cd ./Flowercord_Patcher
/usr/bin/make package

# move it into Enmity_Patches
PACKAGES=$(ls packages)
PATCH_NAME=flowercord
mv packages/$PACKAGES ../Enmity_Patches/$PATCH_NAME.deb

# go back to main dir
cd ..
[[ -e "Enmity_Patches/$PATCH_NAME.deb" ]] && echo "[*] '$PATCH_NAME.deb' has been built successfully." || echo "[*] Error when building '$PATCH_NAME.deb'. Continuing anyway."

# patch the ipa with the dylib tweak (using azule)
[[ -d "Azule" ]] && echo "[*] Azule already exists" || git clone https://github.com/Al4ise/Azule &
wait $!

# inject all of the patches into the enmity ipa
for Patch in $(ls Enmity_Patches/Required) 
do
    Azule/azule -i Dist/Rosiecord_Base.ipa -o Dist -f Enmity_Patches/Required/${Patch} &
    wait $!
    mv Dist/Rosiecord_Base+${Patch}.ipa Dist/Rosiecord_Base.ipa

    Azule/azule -i Dist/Rosiecord_No_Font.ipa -o Dist -f Enmity_Patches/Required/${Patch} &
    wait $!
    mv Dist/Rosiecord_No_Font+${Patch}.ipa Dist/Rosiecord_No_Font.ipa
done

# create a new ipa with each pack injected from the base ipa
for Pack in $(ls Packs)
do
    unzip Dist/Rosiecord_Base.ipa
    cp -rf Packs/${Pack}/* Payload/Discord.app/assets/
    zip -r Dist/Rosiecord_Base+${Pack}_Icons.ipa Payload
    rm -rf Payload

    unzip Dist/Rosiecord_No_Font.ipa
    cp -rf Packs/${Pack}/* Payload/Discord.app/assets/
    zip -r Dist/Rosiecord_No_Font+${Pack}_Icons.ipa Payload
    rm -rf Payload
done

for Ipa in $(ls Dist)
do
    Azule/azule -i Dist/$Ipa -o Dist -f Enmity_Patches/Optional/flowercord.deb &
    wait $!
done