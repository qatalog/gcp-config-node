# qatalog/gcp-config-node

* [What's this?](#whats-this)
* [What's wrong with environment variables?](#whats-wrong-with-environment-variables)
* [How do I use it?](#how-do-i-use-it)
* [Can I still read non-secret properties from the environment?](#can-i-still-read-non-secret-properties-from-the-environment)
* [Can I read non-secret properties from file too?](#can-i-read-non-secret-properties-from-file-too)
* [Can I specify validation options in the schema?](#can-i-specify-validation-options-in-the-schema)
* [Can I specify type coercion options in the schema?](#can-i-specify-type-coercion-options-in-the-schema)
* [What is the full list of properties I can set in the schema?](#what-is-the-full-list-of-properties-i-can-set-in-the-schema)
* [Can schema properties be nested?](#can-schema-properties-be-nested)
* [What happens with secrets that are disabled?](#what-happens-with-secrets-that-are-disabled)
* [How are secrets with multiple versions handled?](#how-are-secrets-with-multiple-versions-handled)
* [Can secret names be prefixed with the runtime environment?](#can-secret-names-be-prefixed-with-the-runtime-environment)
* [How do I run the tests?](#how-do-i-run-the-tests)
* [What versions of Node does it support?](#what-versions-of-node-does-it-support)
* [What license is it released under?](#what-license-is-it-released-under)

## What's this?

A simple config loader for Node.js,
integrated with [@google-cloud/secret-manager](https://www.npmjs.com/package/@google-cloud/secret-manager)
so you can load config settings directly from GCP
without leaking them to the environment.

## What's wrong with environment variables?

Environment variables can be read
by anyone with access to a virtual machine or container.
If you set secrets using environment variables,
anyone with access to your production containers
also has access to your production secrets.
Often you don't want that.

## How do I use it?

Call the `load` method
with your GCP project id
and a config schema
that dictates how settings are loaded:

```js
const gcpConfig = require('@qatalog/gcp-config');

async function main() {
  const config = await gcpConfig.load({
    project: process.env.GCP_PROJECT,

    schema: {
      foo: {
        default: 'default value',
        secret: 'foo',
      },

      bar: {
        secret: 'bar',
      },

      // ...
    },
  });

  // `config` looks like `{ foo, bar }`
}
```

## Can I still read non-secret properties from the environment?

Yes.
Use the `env` property in your schema:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      default: 'wibble',
      env: 'FOO',
    },

    bar: {
      secret: 'bar',
    },
  },
});
```

It's fine to specify both the `env` and `secret` properties
on a single node.
When both are set,
environment variables will take precedence
over secrets.
This can be especially useful
if you want to test local changes
without touching shared secrets.

If your values for `env` and `secret` are the same,
you can also omit `secret` entirely
and we'll full back to using `env`
as the key for GCP Secret Manager too.

## Can I read non-secret properties from file too?

Yes.
Pass the `file` option to `load`:

```js
const config = await gcpConfig.load({
  file: path.join(__dirname, `${process.env.NODE_ENV}.json`),

  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      default: 'wibble',
      secret: 'foo',
    },

    bar: {
      secret: 'bar',
    },
  },
});
```

Properties loaded via `secret` and `env` will take precedence
over properties loaded via the `file` option.

## Can I specify validation options in the schema?

Yes.
Each property in the schema
can set its own `schema` child property
that's used for validation and type coercion
when loading config.
We use [joi](https://www.npmjs.com/package/joi) for validation
so it can be set to any joi schema:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      default: 'wibble',
      schema: joi.valid('wibble', 'blee'),
      secret: 'foo',
    },

    bar: {
      schema: joi.number().integer().positive(),
      secret: 'bar',
    },
  },
});
```

See the [joi api docs](https://joi.dev/api/)
for more information.

## Can I specify type coercion options in the schema?

Yes.
Nodes that have a `joi.string().isoDuration()` schema
can also have a `coerce` option
that marshalls the resulting value to the equivalent number
of milliseconds or seconds:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      coerce: {
        from: 'duration',
        to: 'milliseconds',
      },
      schema: joi.string().isoDuration(),
      secret: 'foo',
    },
  },
});
```

It's likely we'll add more coercion options in future.

## What is the full list of properties I can set in the schema?

All properties are optional:

* `default`:
  The default value,
  used if the environment variable
  and secret are not set
  or not defined in the schema.

* `env`:
  Environment variable
  to read the value from.
  Environment variables take precedence over secrets.

* `secret`:
  The key to lookup the value in GCP Secret Manager.

* `schema`:
  [Joi](https://joi.dev/api/) validation schema for the value.

* `coerce`:
  Instructions for type coercion.
  Value is an object with two properties,
  `from` and `to`.
  Only supports coercion from ISO 8601 `duration` strings
  to numeric `milliseconds` or `seconds`
  right now.

## Can schema properties be nested?

Yes,
schema properties can be nested to arbitrary depth:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      bar: {
        default: 'wibble',
        schema: joi.valid('wibble', 'blee'),
        secret: 'foo_bar',
      },

      baz: {
        qux: {
          schema: joi.number().integer().positive(),
          secret: 'foo_baz_qux',
        },

        // ...
      },
    },
  },
});
```

## What happens with secrets that are disabled?

Disabled secrets are ignored,
effectively they don't exist at all.

## How are secrets with multiple versions handled?

The greatest, non-disabled version of the secret will be used.

## Can secret names be prefixed with the runtime environment?

Yes.
If you prefix your secrets in GCP,
e.g. `production_foo` and `integration_foo`,
you can specify the prefix to use in the call to `load`
and keep the schema constant across all environments:

```js
const config = await gcpConfig.load({
  prefix: `${process.env.NODE_ENV}_`,

  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      default: 'wibble',
      secret: 'foo',
    },

    bar: {
      secret: 'bar',
    },
  },
});
```

## How do I run the tests?

For the tests to pass locally,
you must be authenticated with [gcloud](https://cloud.google.com/sdk/gcloud):

```
gcloud auth login
```

You also need to set the `GCP_PROJECT` environment variable.
The tests will create (and then delete) secrets,
so you should use a clean project
that doesn't contain any real infrastructure.

Then you can just run `npm t`:

```
GCP_PROJECT=my-gcp-project npm t
```

## What versions of Node does it support?

Minimum supported node version is `10.10.0`.

## What license is it released under?

[MIT](LICENSE).
