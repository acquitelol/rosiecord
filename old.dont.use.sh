# -~-~-~ Main Rosiecord Patch Script -~-~-~
# Build to Patch Enmity, Icons, Fonts, and Other Tweaks into the Base Discord IPA.
# Updated by Acquite/Rosie on Wednesday 21st December 2022. Created date unknown.
# Required Dependencies: PLUTIL, LOCAL_DIRS[Fonts, Icons, Enmity_Patches{Required, Optional}], AZULE
#!/bin/bash

# Main Discord IPA Name is Fetched by getting the list of files in the Ipas directory and getting the left side of a cut at '.'
# Afterwards, a new Directory Pointer can be constructed. This ensures that the IPA name itself is available.
IPA_NAME=`ls Ipas | cut -d'.' -f1`;
IPA_DIR=Ipas/$IPA_NAME.ipa;

# Define the different BASH colors. These can be used quite easily inside of `printf`.
RED='\033[91m'
GREEN='\033[92m'
YELLOW='\033[93m'
BLUE='\033[94m'
PINK='\033[95m'
CYAN='\033[96m'
ENDC='\033[0m'


# Make a new directory called Dist, remove all existing contents of the Directory, and finally remove the Payload folder if it exists.
printf "$PINK[$CYAN*$PINK]$CYAN Clearing existing $PINK\"IPAs\"$CYAN in $PINK\"./Dist\".$ENDC\r";
mkdir -p Dist/ & wait $!; rm -rf Dist/* & wait $!; rm -rf Payload & wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully cleared existing $PINK\"IPAs\"$GREEN in $PINK\"./Dist\".$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while clearing existing $PINK\"IPAs\" in $PINK\"./Dist\".$ENDC"; exit -1; fi

# Echo to the console the directory of the IPA which will be patched using these Colors Defined at the top level.
echo "$PINK[$CYAN+$PINK]$GREEN Directory of IPA: $PINK$IPA_DIR$ENDC";

# Unzip the IPA and wait for the event to finish.
printf "$PINK[$CYAN*$PINK]$CYAN Unzipping $PINK\"$IPA_DIR\"$CYAN into $PINK\"./Payload\".$ENDC\r";
unzip -qq -o $IPA_DIR &wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully unzipped $PINK\"$IPA_DIR\"$GREEN into $PINK\"./Payload\".$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while unzipping $PINK\"$IPA_DIR\".$ENDC"; exit -1; fi

# Set the Main Plist of the Payload to a Variable as it is quite a long target. This lets us save a lot of time rewriting the directory target of the Plist.
MAIN_PLIST=Payload/Discord.app/Info.plist

# First, replace the name of Discord to Rosiecord
printf ;
plutil -replace CFBundleName -string "Rosiecord" $MAIN_PLIST & wait $!;
plutil -replace CFBundleDisplayName -string "Rosiecord" $MAIN_PLIST & wait $!;
if [ $? -eq 0 ]; then echo ; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while Replacing $PINK\"Discord's Name\".$ENDC"; exit -1; fi

# patch discord's url scheme to add enmity's url handler
printf "$PINK[$CYAN*$PINK]$CYAN Patching Discord's URL Scheme To $PINK\"Add Enmity's URL Handler\".$ENDC\r";
plutil -insert CFBundleURLTypes.1 -xml \
    "<dict>
        <key>CFBundleURLName</key>
        <string>Enmity</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>enmity</string>
        </array>
    </dict>" $MAIN_PLIST & wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully Patched $PINK\"Discord's URL Scheme\"$GREEN to $PINK\"./Add Enmity's URL Handler\".$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while Patching $PINK\"Discord's URL Scheme.\".$ENDC"; exit -1; fi

# remove discord's device limits
printf "$PINK[$CYAN*$PINK]$CYAN Removing Discord's $PINK\"Supported Device Limits\"$CYAN.$ENDC\r";
plutil -remove UISupportedDevices $MAIN_PLIST & wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully Removed Discord's $PINK\"Supported Device Limits\"$GREEN.$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while removing Discord's $PINK\"Supported Device Limits\"$RED.$ENDC"; exit -1; fi

# patch the icons
printf ;
cp -rf Icons/* Payload/Discord.app/ > /dev/null
plutil -replace CFBundleIcons -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" $MAIN_PLIST & wait $!;
plutil -replace CFBundleIcons~ipad -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string><string>EnmityIcon76x76</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" $MAIN_PLIST & wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully Patched $PINK\"Discord's Icons\"$GREEN to $PINK\"Enmity's Icons\"$GREEN.$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while removing Discord's $PINK\"Supported Device Limits\"$RED.$ENDC"; exit -1; fi

# patch itunes and files
printf "$PINK[$CYAN*$PINK]$CYAN Enabling $PINK\"UISupportsDocumentBrowser\" $CYAN and $PINK\"UIFileSharingEnabled\"$CYAN.$ENDC\r";
plutil -replace UISupportsDocumentBrowser -bool true $MAIN_PLIST & wait $!;
plutil -replace UIFileSharingEnabled -bool true $MAIN_PLIST & wait $!;
if [ $? -eq 0 ]; then echo "$PINK[$CYAN+$PINK]$GREEN Successfully Enabled $PINK\"UISupportsDocumentBrowser\"$GREEN and $PINK\"UIFileSharingEnabled\"$GREEN.$ENDC"; else echo "$PINK[$CYAN-$PINK]$RED An error occurred while Enabling $PINK\"UISupportsDocumentBrowser\"$RED and $PINK\"UIFileSharingEnabled\"$RED.$ENDC"; exit -1; fi

# run the main js portion to package each font.
node . 0

# remove dir contents incase it exists
rm -rf Flowercord_Patcher/packages/* > /dev/null

# package the deb
cd ./Flowercord_Patcher
/usr/bin/make package > /dev/null

# move it into Enmity_Patches
PACKAGES=$(ls packages)
mv packages/$PACKAGES ../Enmity_Patches/Optional/flowercord.deb

# go back to main dir
cd ..

# patch the ipa with the dylib tweak (using azule)
[[ -d "Azule" ]] && echo "$PINK[$CYAN*$PINK]$BLUE Azule$GREEN already exists..." || git clone https://github.com/Al4ise/Azule & wait $!

# inject all of the patches into the enmity ipa
node . 1

# create a new ipa with each pack injected from the base ipa
node . 2

# get flowercord variations
node . 3