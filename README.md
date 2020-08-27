`auth-github-registry` configures `yarn` and `npm` with an authentication token
for the Github package registry.

You will need to add more configuration to your projects for `yarn` or `npm` to
actually use the Github package registry, see below.

### Usage

It takes no arguments, just run it using `npx auth-github-registry`:

```
$ npx auth-github-registry
Requesting login parameters...
Please sign in at https://github.com/login/device
  and enter code: 1AB2-C34D
waiting for Github...
Success!
```

If you are already authenticated, then `auth-github-registry` will tell you, and
do nothing:

```
$ npx auth-github-registry
Requesting login parameters...
You are already authenticated!
```

### Setting up Github package repository...

When you run `auth-github-registry` it gets an access token from Github with
the `read:packages`, `write:packages` `delete:packages` and `repo` scope, and
writes it to your `~/.npmrc` like so:

```
//npm.pkg.github.com/:_authToken=XXX
```

This is necessary, but not sufficient for Github Registry to work. You also
need to change the configuration of packages you wish to upload and also of
projects that use them.

To configure a project to read private packages from the Github registry, you
need to add a `.npmrc` in the same directory as its `package.json` that
contains the instruction to read packages scoped to your organization name from
Github, for example:

```
# .npmrc
@superhuman:registry=https://npm.pkg.github.com/
```

To configure a package to be published on the Github Registry you need to ensure three things about its `package.json`:
1. The `"name"` must begin with your organization name, e.g. `@superhuman`.
2. The `"repository"` must be set to a Github repo that exists, e.g. `"git://github.com/superhuman/mail"`
3. The `"publishConfig"` must contain `{"registry": "https://npm.pkg.github.com/"}`

For example:

```
# package.json
{
  "name": "@superhuman/shared",
  ...
  "repository": "git://github.com/superhuman/mail",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  }
}
  ```

After this `npm publish` will write to the Github registry. If you see 404
errors during `npm publish` it likely means you have not set the `"repository"`
field correctly, but could also mean you have an auth token for Github Registry
in your `~/.npmrc` that doesn't include the `repo` scope.

### Development

You can run the code with `ts-node ./index.ts`, and format it with `prettier -w
index.ts`, and release it with `npm publish`.

### License (MIT)

Copyright 2020 Conrad Irwin <conrad@superhuman.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
