# Shipping doku+ to the stores

Two automated pipelines, both cloud-only (no computer needed):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/android-release.yml` | every push to `main` | fast web build check (`npm ci && npm run build`) — catches broken JS/TS |
| `.github/workflows/store-release.yml` | push a tag `v*` or manual dispatch | builds a **signed AAB → Play internal testing** and an **iOS build → TestFlight** |

To ship a store build: `git tag v1.0.0 && git push origin v1.0.0`.

You can also run `store-release` manually (Actions → Store release → Run workflow).
It has an **`ios_only`** input to skip the Android job when you only need to
re-test the iOS path.

---

## One-time setup — GitHub repo secrets

Add each at **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**.

### Android (4 secrets) — keystore
Already generated for you. From the keystore note I sent:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | entire contents of `dokuplus-upload.jks.base64.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | (in the note) |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | (same as keystore password) |

### Android (1 secret) — Play API
| Secret | How to get it |
| --- | --- |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Console → Setup → API access → create/link a Google Cloud **service account**, grant it "Release to testing tracks", download its **JSON key**, paste the whole file |

> The app `app.dokuplus` must exist in Play Console and have **one AAB uploaded manually** to internal testing first (Google requires the first upload by hand). After that, the pipeline takes over.

### iOS (4 secrets) — App Store Connect API key
At **App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → +**, role **App Manager**. Download the `.p8` once.

| Secret | Value |
| --- | --- |
| `ASC_KEY_ID` | the Key ID shown next to the key |
| `ASC_ISSUER_ID` | the Issuer ID at the top of that page |
| `ASC_KEY_P8_BASE64` | base64 of the `.p8` file (`base64 -i AuthKey_XXXX.p8`) |
| `APPLE_TEAM_ID` | your 10-char Team ID (Apple Developer → Membership) |

### iOS (3 secrets) — distribution signing
CI runs on **ephemeral macOS runners**, so automatic signing (`-allowProvisioningUpdates`)
**cannot work** — it can't install a certificate's private key into the runner's
keychain. We use **manual signing**: a distribution certificate (`.p12`) and an
App Store provisioning profile, supplied as secrets. See
[Generating the iOS signing assets](#generating-the-ios-signing-assets) below for how to create these.

| Secret | Value |
| --- | --- |
| `IOS_DIST_CERT_P12_BASE64` | base64 of the Apple Distribution `.p12` |
| `IOS_DIST_CERT_PASSWORD` | the password you set when exporting the `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | base64 of the App Store `.mobileprovision` |

### iOS prerequisites (one-time, in the Apple portals)
1. **Register the App ID** `app.dokuplus` at *Certificates, Identifiers & Profiles → Identifiers*.
   This is separate from the App Store Connect app record and must exist before a
   provisioning profile can be created.
2. **Create the app record** in App Store Connect (*Apps → +*) with bundle id `app.dokuplus`.
   TestFlight uploads fail with *"Couldn't find app"* until this exists.

> **Xcode 26 required.** Capacitor 8's precompiled framework gates core APIs
> (e.g. `CAPPluginCall.reject`) behind a Swift 6.2 feature, so it only compiles on
> Xcode 26+. The iOS job therefore runs on the **`macos-26`** runner. Don't move it
> back to an older macOS image. (Ref: ionic-team/capacitor#8333.)

---

## Generating the iOS signing assets
Mac-free — done once with `openssl` + the Apple portal. Keep the outputs **outside
the repo** and back them up; you need them to ship every update, and the certificate
expires after one year.

1. **Make a private key + CSR:**
   ```bash
   openssl genrsa -out dist.key 2048
   openssl req -new -key dist.key -out dist.csr \
     -subj "/emailAddress=YOU@example.com/CN=DokuPlus Distribution/C=US"
   ```
2. **Create the certificate:** *Certificates, Identifiers & Profiles → Certificates → +
   → Apple Distribution*, upload `dist.csr`, download the resulting `.cer`.
3. **Create the profile:** *Profiles → + → App Store Connect* (Distribution), pick App ID
   `app.dokuplus`, select the **Apple Distribution** certificate you just made (not an
   older *iPhone Distribution* one — the profile's cert must match the `.p12`), name it,
   download the `.mobileprovision`.
4. **Build the `.p12` and base64 everything:**
   ```bash
   openssl x509 -inform DER -in distribution.cer -out dist.pem
   openssl pkcs12 -export -inkey dist.key -in dist.pem -out dist.p12 \
     -name "Apple Distribution" -passout pass:YOUR_P12_PASSWORD
   base64 -w0 dist.p12               > IOS_DIST_CERT_P12_BASE64.txt
   base64 -w0 your.mobileprovision   > IOS_PROVISIONING_PROFILE_BASE64.txt
   ```
   Then set the three iOS signing secrets from these (and the password you chose).

> The workflow reads the profile's embedded **Name** automatically, so you don't need
> to hardcode it. If you regenerate the profile, only `IOS_PROVISIONING_PROFILE_BASE64`
> needs updating.

---

## Versioning
- Android `versionCode` is set automatically from the CI run number; `versionName` from the tag.
- iOS build number is managed by Xcode/fastlane on upload.

## Bundle id
`app.dokuplus` is a placeholder in `capacitor.config.ts`, `android/app/build.gradle`,
and the Xcode project. If you want a different reverse-domain id, change it in all
three before the first store upload (it can't change afterward).
