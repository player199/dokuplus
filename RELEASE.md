# Shipping doku+ to the stores

Two automated pipelines, both cloud-only (no computer needed):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/android-release.yml` | every push to `main` | builds a debug APK, attaches it to the rolling **latest** GitHub Release |
| `.github/workflows/store-release.yml` | push a tag `v*` | builds a **signed AAB → Play internal testing** and an **iOS build → TestFlight** |

To ship a store build: `git tag v1.0.0 && git push origin v1.0.0`.

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

> Create the app record in App Store Connect with bundle id `app.dokuplus` first
> (My Apps → +). The pipeline uses `-allowProvisioningUpdates`, so it creates the
> signing cert + provisioning profile automatically on the first run.

---

## Versioning
- Android `versionCode` is set automatically from the CI run number; `versionName` from the tag.
- iOS build number is managed by Xcode/fastlane on upload.

## Bundle id
`app.dokuplus` is a placeholder in `capacitor.config.ts`, `android/app/build.gradle`,
and the Xcode project. If you want a different reverse-domain id, change it in all
three before the first store upload (it can't change afterward).
