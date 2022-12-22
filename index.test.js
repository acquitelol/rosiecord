import { exec } from 'node:child_process';

exec(`plutil -insert CFBundleURLTypes.1 -xml "<dict><key>CFBundleURLName</key><string>Enmity</string><key>CFBundleURLSchemes</key><array><string>enmity</string></array></dict>" Payload/Discord.app/Info.plist & wait $!;`, (errs, output) => {
    console.log(output)
    console.log(errs)
})