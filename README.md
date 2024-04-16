# @qatalog/gcp-config

* [What's this?](#whats-this)
* [What's wrong with environment variables?](#whats-wrong-with-environment-variables)
* [How do I use it?](#how-do-i-use-it)
* [Can schema properties be nested?](#can-schema-properties-be-nested)
* [Can I still read non-secret properties from the environment?](#can-i-still-read-non-secret-properties-from-the-environment)
* [Can I read non-secret properties from file?](#can-i-read-non-secret-properties-from-file)
* [Can I specify validation options in the schema?](#can-i-specify-validation-options-in-the-schema)
* [Can I specify type coercion options in the schema?](#can-i-specify-type-coercion-options-in-the-schema)
* [Can I flag properties as required?](#can-i-flag-properties-as-required)
* [What is the full list of properties I can set in the schema?](#what-is-the-full-list-of-properties-i-can-set-in-the-schema)
* [What happens with secrets that are disabled?](#what-happens-with-secrets-that-are-disabled)
* [How are secrets with multiple versions handled?](#how-are-secrets-with-multiple-versions-handled)
* [Can secret names be prefixed with the runtime environment?](#can-secret-names-be-prefixed-with-the-runtime-environment)
* [Is there a way to disable reading secrets at runtime?](#is-there-a-way-to-disable-reading-secrets-at-runtime)
* [How do I run the tests?](#how-do-i-run-the-tests)
* [What versions of Node does it support?](#what-versions-of-node-does-it-support)
* [Is there a changelog?](#is-there-a-changelog)
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
const joi = require('joi');

const CONFIG_SCHEMA = {
  foo: {
    secret: 'name_of_secret_in_gcp',
  },

  bar: {
    default: 'default value',
    secret: 'name_of_another_secret_in_gcp',
  },

  // ...
};

main();

async function main() {
  const config = await gcpConfig.load({
    project: process.env.GCP_PROJECT,
    schema: CONFIG_SCHEMA,
  });

  assert(typeof config.foo === 'string');
  assert(typeof config.bar === 'string');

  // ...
}
```

## Can schema properties be nested?

Yes.
Schema properties can be nested to arbitrary depth,
generating the equivalent tree structure
in the returned config object:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      bar: {
        secret: 'foo_bar',
      },

      baz: {
        qux: {
          secret: 'foo_baz_qux',
        },
      },
    },
  },
});

assert(typeof config.foo === 'object');
assert(typeof config.foo.bar === 'string');
assert(typeof config.foo.bar.baz === 'object');
assert(typeof config.foo.bar.baz.qux === 'string');
```

## Can I still read non-secret properties from the environment?

Yes.
Use the `env` property in your schema
to load a value from an environment variable
rather than GCP Secret Manager:

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      env: 'FOO',
    },

    bar: {
      secret: 'bar',
    },

    baz: {
      env: 'BAZ',
      secret: 'baz',
    },
  },
});
```

It's fine to specify both the `env` and `secret` properties
on a single node.
When both are set,
environment variables take precedence over secrets.
This can be especially useful
if you want to test changes locally,
without touching shared secrets.

## Can I read non-secret properties from file?

Yes.
Pass the `file` option to `load`:

```js
const config = await gcpConfig.load({
  file: path.join(__dirname, `${process.env.NODE_ENV}.json`),

  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      secret: 'foo',
    },

    bar: {
      baz: {
        secret: 'bar_baz',
      },

      qux: {
        secret: 'bar_qux',
      },
    },
  },
});
```

`file` should be the path to a JSON file
that matches the structure of your schema:

```json
{
  "foo": "wibble",
  "bar": {
    "qux": "blee"
  }
}
```

The file does not need to contain
every property from the schema
and any additional properties will be ignored.

Properties loaded with the `file` option
take precedence over default values,
but properties loaded via `secret` or `env`
take precedence over `file`.

## Can I specify validation options in the schema?

Yes.
Each node can have its own `schema` property
that's used for validation and type coercion.
We use [joi](https://www.npmjs.com/package/joi) for validation
so you can set `schema` to any joi schema:

```js
const joi = require('joi');

const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      schema: joi.valid('wibble', 'blee'),
      secret: 'foo',
    },

    bar: {
      schema: joi.number().integer().positive(),
      secret: 'bar',
    },
  },
});

assert(typeof config.foo === 'string');
assert(typeof config.bar === 'number');
```

If a config value violates its schema,
the promise returned by `load`
will be rejected
with the relevant error from `joi.attempt()`.
This is true regardless of
whether the value was loaded
using `env`, `secret`, `file` or `default`.

See the [joi api docs](https://joi.dev/api/)
for more information
about validation and type coercion.

## Can I specify type coercion options in the schema?

Yes.

* Nodes with a `joi.array()` schema
  can have a `coerce` option
  that marshalls the JSON array string
  to a JS array object:

  ```js
  const config = await gcpConfig.load({
    project: process.env.GCP_PROJECT,

    schema: {
      foo: {
        coerce: {
          from: 'string',
          to: 'array',
        },
        schema: joi.array().items(joi.valid('wibble', 'blee')),
        secret: 'foo',
      },
    },
  });

  assert(Array.isArray(config.foo));
  ```

* Nodes with a `joi.string().isoDuration()` schema
  can have a `coerce` option
  that marshalls the duration string
  to the equivalent number of milliseconds or seconds:

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

  assert(typeof config.foo === 'number');
  ```

It's likely we'll add more type coercion options in future.

## Can I flag properties as required?

Yes.
Set `required: true` on those nodes in your schema:


```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      required: true,
      secret: 'foo',
    },

    bar: {
      required: true,
      secret: 'bar',
    },
  },
});
```

If required properties are not set by any data source,
the promise returned from `load` will be rejected.
Required properties with default values
will never fail.

## What is the full list of properties I can set in the schema?

All properties are optional:

* `env`:
  Environment variable
  to read the value from.
  Environment variables take precedence over secrets.

* `secret`:
  The key to lookup the value in GCP Secret Manager.

* `default`:
  The default value,
  used as fallback if no other values are found
  in the environment, Secret Manager or from file.

* `schema`:
  [Joi](https://joi.dev/api/) validation schema for the value.

* `coerce`:
  Instructions for type coercion.
  Value is an object with two properties,
  `from` and `to`.
  Only supports coercion from ISO 8601 `duration` strings
  to numeric `milliseconds` or `seconds`
  right now.

* `required`:
  Boolean indicating whether absence of the value
  should be treated as an error.
  Defaults to `false`.

## What happens with secrets that are disabled?

Disabled secrets are ignored,
effectively they don't exist at all.

## How are secrets with multiple versions handled?

The greatest, non-disabled version of the secret will be used by default.
For using a specific version set `version: <your_version>` in the schema.

```js
const config = await gcpConfig.load({
  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      version: 1, // Specific version. Make sure this version exists or it is not disabled.
      secret: 'foo',
    },
  },
});
```

## Can secret names be prefixed with the runtime environment?

Yes.
If you prefix the keys for your secrets in GCP,
e.g. `production_foo` and `integration_foo`,
you can specify that prefix in the call to `load`
and keep the body of your schema
constant across all environments:

```js
const config = await gcpConfig.load({
  prefix: `${process.env.NODE_ENV}_`,

  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      // Might load `production_foo` or `development_foo` etc
      secret: 'foo',
    },
  },
});
```

## Is there a way to disable reading secrets at runtime?

Yes.
Secrets will not be loaded
if the `ignoreSecrets` option to `load` is `true`:

```js
const config = await gcpConfig.load({
  ignoreSecrets: process.env.NODE_ENV === 'test',

  project: process.env.GCP_PROJECT,

  schema: {
    foo: {
      default: 'default value',
      // Won't be loaded when `NODE_ENV` is `test`
      secret: 'foo',
    },
  },
});
```

This can be useful in test environments,
when running many tests in quick succession
can exceed the available read quota
for Secret Manager.
Nobody likes flaky tests.

## How do I run the tests?

For the tests to pass locally,
you must be authenticated with [gcloud](https://cloud.google.com/sdk/gcloud):

```
gcloud auth login
```

You also need to set the `GCP_PROJECT` environment variable.
The tests will create, read and delete secrets,
so you should use a clean project
that doesn't contain any real infrastructure.
Your IAM user or service account
will need the `Secret Manager Admin`
and `Secret Manager Secret Accessor` roles.

With all that set,
you can run the tests with `npm t`:

```sh
GCP_PROJECT=my-gcp-project npm t
```

## What versions of Node does it support?

Minimum supported node version is `14`.

## Is there a changelog?

[Yes](CHANGELOG.md).

## What license is it released under?

[MIT](LICENSE).
