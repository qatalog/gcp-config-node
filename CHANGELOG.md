# History

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
