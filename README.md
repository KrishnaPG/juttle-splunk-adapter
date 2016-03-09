# Juttle Splunk Adapter

[Splunk](http://www.splunk.com/) adapter for the [Juttle data flow
language](https://github.com/juttle/juttle), with read support.

Currently supports Splunk 6.3.

## Examples

Read entries from the `_internal` index where the `host` is `www123`:

```juttle
read splunk index='_internal' host='www123' | view text
```

## Installation

Like Juttle itself, the adapter is installed as a npm package. Both Juttle and
the adapter need to be installed side-by-side:

```bash
$ npm install juttle
$ npm install juttle-splunk-adapter
```

## Configuration

The adapter needs to be registered and configured so that it can be used from
within Juttle. To do so, add the following to your `~/.juttle/config.json` file:

```json
{
    "adapters": {
        "splunk": {
            "scheme": "https",
            "host": "localhost",
            "port": "8089",
            "username": "admin",
            "password": "splunk"
        }
    }
}
```

The `scheme`, `host` and `port` should point to the API url of your Splunk instance.
The default settings of `https`, `localhost` and `8089` will be used as defaults.

Please note that Splunk 6.3 won't allow access to the API if default admin password `changeme`
is used. To enable it, please change the password and update the Juttle config accordingly.

## Usage

### Read options

When reading data, large part of SPL syntax is expressible through and similar
to Juttle [filter expressions](http://juttle.github.io/juttle/concepts/filtering/).

Notable omissions, which aren't translated from Juttle to SPL are:

* Juttle supports `in` operator for testing inclusion of a value in an array.
  This operator is missing from SPL. This Juttle query can be rewritten using a
  sequence of `or` operators.

* Juttle supports filtering results using regular expression operators on
  fields - `=~` and `!~`. Instead, SPL uses `| regex` filter to accomplish a
  similar task. Same pattern can be used in Juttle - `read splunk ... | filter
  field =~ /regexp/`.

The following options are supported by `read`:

Name | Type | Required | Description
-----|------|----------|-------------
`fields` | string | no | additional fields to add to the results (default: none)
`from` | moment | no | select points after this time (inclusive)
`to`   | moment | no | select points before this time (exclusive)

The filter expressions can be placed after the above options in `read splunk`. Supported filters are:

- `fieldname = value` also `!=`, and `<`/`>` for numbers
- combining filter expressions with `AND`, `OR`, `NOT`

## Contributing

Want to contribute? Awesome! Don’t hesitate to file an issue or open a pull
request.
