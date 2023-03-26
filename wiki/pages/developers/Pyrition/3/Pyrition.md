# Localization Using Pyrition
For the sake of consistency, **localization** is the process of making your code compatible with other languages.  
We're going to ignore others' definitions. Localized code can have translations made to substitute text with the proper language. The component in Pyrition uses the existing localization system available in the Source engine, but has a powerful parser to correctly format variable text into localization phrases, **with context**.

# Formatting
To substitute tags in our localized phrases, multiple variants of the `LanguageFormat` method are available. Based on the tag, the text substituted will behave differently. The color and even the text to substitute can change with kieve functions. A kieve function is a function that runs for specified tags when they have additional key values attached. The function will use the kieve functions for context in deciding the text used for substitution.

# Breakdowns with Samples
### Map Change
Most simple example that has formatting. The order of the tags does not matter. You can even duplicate tags if you want to have the text substituted in multiple places.  

EN: `pyrition.map.change=The server's map is changing to [:map] in [:time] seconds!`  

CC: `pyrition.map.change=Wkh vhuyhu'v pds lv fkdqjlqj wr [:map] lq [:time] vhfrqgv!`
| Term | Examples using sample
| --- | ---
| Localization key | `pyrition.map.change`
| Localization phrase/translation | `The server's map is changing to [:map] in [:time] seconds!`
| Tag | `[:map]` `[:time]`
| Tag name | `map` `time`

### Goto Command
A simple example compared to most other command success responses. The `executor` and `target` tag have a kieve function applied to them that will fetch the `you` key value and use that in place of the original substitution text.  Basically, if the `executor` is `you`, use `You` instead of your name.  

EN: `pyrition.commands.goto.success=[:executor:you=You] teleported to [:target:you=you].`  

CC: `pyrition.commands.goto.success=[:executor:you=Brx] whohsruwhg wr [:target:you=brx].`
| Term | Examples using sample
| --- | ---
| Localization key | `pyrition.commands.goto.success`
| Localization phrase/translation | `[:executor:you=You] teleported to [:target:you=you].`
| Tag | `[:executor:you=You]` `[:target:you=you]`
| Tag name | `executor` `target`
| Tag key | `:you` `:you`
| Tag key value | `:you=You` `:you=you`
| Tag value | `You` `you`

### Send Command
Multiple keys can have any amount of values. That means a key can have no values or even 80 values. Each value is seperated by `=` and each key value is seperated by `:`. The `target` and `targets` tag has a kieve function that makes use of the `you`, `self`, and `themself` key values. `you` works just like the previous example, `self` will be used instead of `you` if the `executor` tag's `you` key value is used. After all those checks, if `target`/`targets` and `executor` match, the `themself` key value will be used.  

EN: `pyrition.commands.send.success=[:executor:you=You] sent [:targets:you=you:self=yourself:themself=themself] to [:target:you=you:self=yourself:themself=themselves].`  

CC: `pyrition.commands.send.success=[:executor:you=Brx] vhqw [:targets:you=brx:self=brxuvhoi:themself=wkhpvhoi] to [:target:you=brx:self=brxuvhoi:themself=wkhpvhoyhv].`
| Term | Examples using sample
| --- | ---
| Localization key | `pyrition.commands.send.success`
| Localization phrase/translation | `[:executor:you=You] sent [:targets:you=you:self=yourself:themself=themself] to [:target:you=you:self=yourself:themself=themselves].`
| Tag | `[:executor:you=You]` `[:targets:you=you:self=yourself:themself=themself]` `[:target:you=you:self=yourself:themself=themselves]`
| Tag name | `executor` `targets` `target`
| Tag key | `:you` `:self` `:themself`
| Tag key value | `:you=You` `:you=you` `:self=yourself` `:themself=themself` `:you=you` `:self=yourself` `:themself=themselves`

# Kieve Functions
Expect more to come. All keys are optional, but the kieve will not run if there are no keys specified inside the tag.
| Tag Names | Keys
| :---: | :---:
| All tags | `append` `elfix` `elpend` `prefix`
| `executor` | `console` `you`
| `target` `targets` | `self` `themself` `you`

## Kieve Function Key Purposes
Conform now or else.  
A `color` tag value can be command, console, default, everyone, misc, player, self, unknown, or an RGB seperated by `,`. Spaces are ignored in color tag values.
| Key | Values | Purpose
| :---: | :---: | :---
| `append` | `postfix` `color` | Postfixes the substituted text if the kieve functions modify the substituted text.
| `console` | `substitute` | If the substituted text is the server, then use `substitute`.
| `elfix` | `prefix` `color` | Short for "else prefix" and will prefix the substituted text if the no kieve functions modify the substituted text.
| `elpend` | `postfix` `color` | Short for "else append" and does the same as `elfix` but postfixes the substituted text instead.
| `prefix` | `prefix` `color` | Does the same as `append` but prefixes instead of postfixing.
| `self` | `substitute` | Activates when both the `executor` tag and the parent tag are the local player. Priority over `themself` and `you`.
| `themself` | `substitute` | Activates when both the `executor` tag and the parent tag are the same player. Priority over `you`.
| `you` | `substitute` | Activates when the substituted text is the local player.

# For Developers
Plenty of good examples of registering kieve functions and tag colors are available in the Language module's [shared.lua](https://github.com/Cryotheus/pyrition_2/blob/main/lua/pyrition/language/shared.lua) file. Find usage of these functions in the `#post` section of the file, at the bottom.  
Please note that the `phrases` tables can have values that are players.
