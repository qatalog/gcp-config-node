# History

## 0.5.1

### Other changes

* read-value: throw exception when error different from not found (#27) (50a6f9d34d2363e822d99252b4f59d461853f569)
* retry: dont retry on specific error codes (d9da074736ece3bbb5c0e9d0be6c268a4ca55c1c)
* deps-dev: bump lint-staged from 12.1.5 to 12.1.7 (266999b6f1d2a95300aba52b5053de7edc6cc98a)

## 0.5.0

### New features

* secrets: retry failed secrets once to mitigate intermittent errors (458fd933d3df04e630428a78f0656ce07bf79ec4)

### Other changes

* deps-dev: bump lint-staged from 12.1.4 to 12.1.5 (8217b2aacccf92f7453006e88a43bc7e98352570)
* deps-dev: bump eslint from 8.5.0 to 8.6.0 (4885d42121eebe175e7d79ad292eceda4dcce6c9)
* deps-dev: bump lint-staged from 12.1.3 to 12.1.4 (bb7481b6be0dd7c25bc622fc7950d989f36e0964)
* deps-dev: bump eslint from 8.4.1 to 8.5.0 (b70507993b769fe10d2e7a7c13ebd9e89fa1fadc)
* deps-dev: bump lint-staged from 12.1.2 to 12.1.3 (1b2ef3e98158e8e63b881fdc688287f879140d8c)
* deps-dev: bump eslint-plugin-mocha from 10.0.1 to 10.0.3 (e1b5b10f8b3d8060102445c1a7f0ae32daa6626f)
* deps-dev: bump eslint-plugin-mocha from 10.0.0 to 10.0.1 (24ab8199fb489455eb2dba4cb03be9d31a17e347)
* deps-dev: bump prettier from 2.4.1 to 2.5.1 (71c90b1ecc0d10d6972ee46802cf4fab0548673d)
* deps-dev: bump lint-staged from 11.2.6 to 12.1.2 (247461c9cce8ba091168d4d16a7e34622fa14d9e)
* deps-dev: bump eslint-plugin-mocha from 9.0.0 to 10.0.0 (cb1986ef948d3af393f7372b1c8653172b97d05d)
* deps-dev: bump joi from 17.4.2 to 17.5.0 (1a870f51e2b90d90d8af3f3cf3add3280b4ab0f4)
* deps-dev: bump eslint from 8.2.0 to 8.4.1 (ebbb54064e6e85f68c2c945c8a47af28977b394b)
* deps: enable dependabot (e058f12dd4a3df13b64fec2214456be96adbc05c)

## 0.4.1

### Bug fixes

* validation: more useful error messages across the board (e2d4d3dd963861f5e17965020f2702cb34b59a6b)

## 0.4.0

### New features

* validation: include keys in `required` error (bab488d599f962ddffed28ca168f88ddb32144f5)

## 0.3.0

### New features

* api: implement `required` schema option (15629a01007844fe0486b43327cfa6b5952dbf1b)

### Bug fixes

* ci: fix invalid yaml in codeql config (9e213ef535c10b4414d03a7259ed20b05281fbdd)

### Other changes

* docs: add `require('joi')` to example code (2a427873977dc4806536d53b1d71f9c2e6d1602e)
* ci: fix yaml formatting (7f3c7433a060f4bd410a6e425bdfc3d9beb16ad1)
* ci: enable codeql analysis (3149da00f1c80bdc9b1f70d8abd4d6251c7f7f8f)
* ci: rename `check-pr` concurrency group (cf9a13e444e439a5db6a7a8f16ceda92b4d5bc9f)

## 0.2.1

### Bug fixes

* ci: also add `joi` to `devDependencies` (5b45b403b62bf50efe6ed2c6d0a174602dc1b6c4)

### Refactorings

* tests: extract a separate test module for options (d6bcce0f244d94c180b7144d532e3caf0998edd4)

### Other changes

* deps: move `joi` back to `peerDepedencies` (0eb0678548fbe5af43fe338c28b73f1d1baec5d7)

## 0.2.0

### New features

* api: add `ignoreSecrets` option to `load` (52fd3d3425a5b29b378e361b47267e074c0f5206)

### Other changes

* tests: unique secret keys per test (a70801696a443ffc114436d97021b0156c2460bf)
* docs: readme tweaks (00c44505a3417586f45366bc20621023a59af840)

## 0.1.2

### Bug fixes

* defaults: ensure empty schema nodes get actualised in the result (4682305fb58ef9b920c16e4b77c9588356508cfb)

### Refactorings

* impl: pull logic out to focused modules (89a55d57bf37ad92ac55d460ffc30db59b3e20bf)

## 0.1.1

### Other changes

* docs: retrospectively add full git sha to changelog (2b1c8b2a3a0159559e947e9fc09a9187a7ed5d41)
* deps: upgrade `please-release-me` to `2.1.4` (35299882ac77f15e61cdf6a3e2ba52e9a948e110)
* docs: tweak the readme for clarity (2fa96ad633b4cec06d986a99495d62efc5cfc795)

## 0.1.0

### New features

* api: implement `coerce` option for durations (8465014e4de464f070b1657afd456b54e4910173)
* api: support loading from file (54633b06d1a1088094ebb5f4947cc96641b91fc6)
* api: support validation using `joi` (30dc8801af1f6066ad391f54c5e0fe6d69a244ab)
* api: implement `load` method (7ee2b17c7b9a7dcb7e3f9e73ec89925af512d987)

### Bug fixes

* tests: generate unique keys for fixture secrets (47993b7d6b79201a0a8159be546c5f0efd24ca3d)

### Other changes

* docs: add `CHANGELOG.md` (aa4ae067ca8df652ce5248a5d03ee753c95d74dc)
* docs: make the readme a bit clearer (aa197fcd125156716247f87ddfe677dec164400b)
* deps: move `joi` back to `depedencies` (c5ae4c9c6230db31c6f124146ff1c05feddae731)
* repo: add a release-tagging script (a036b34ed52f5aa0c240882e8b9b07e59b4ef548)
* ci: run tests on multiple versions of node (97d6b990aeb7a1898f1eeea9efe29f7244a7a72f)
* ci: remove redundant invocation of `npm run check` (79524aaaa7b1a360437fb4c165468d07a789d3c7)
* ci: add a job to check prs (a16cc5a60f10edc9b473448cb7105ecc23696560)
* docs: add `README.md` (0ea948f9dbbe5830c86be53496a03d6cd0bf6131)
* repo: add `LICENSE` (96b8049aebc59e9f365ba87179002e771c90e09a)
* repo: add `AUTHORS` (18f7361fd8bfb754174e91cffada4b1b7a507a6d)
* repo: set up `eslint` and `prettier` (dd511aeacce5ca47b091dcd644cf6e45e9579348)
* deps: move `joi` to `peerDependencies` (9a6bcc7e8a21a51c2c18cc2a0af2ea7d19d28351)

## 0.0.0

The dawn of time.
