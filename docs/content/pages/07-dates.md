# Working with Dates

There are two places where wanderer looks for dates to determine a page's date:

1. the file's last update date in the system
2. the tempo string prefixing the page's name (see [the pretty url section](./frame-content) for how this works)

If there is a tempo string defined, the page's **date** value will automatically be set to that date on the tempo string. Otherwise, the **date** value will be set to the update date, and thus be the same as the **update** value.

You can use both **date** and **updated** in your templates:

```
This page was created (or had the date set to) ${date(o.date)}.

This page was last updated on ${date(o.updated)}.
```

## Tempo Strings

Tempo strings are a frankly esoteric way to define dates that is supposed to be more human writable than ISO, and also list files chronologically when organizing in alphabetical order.

It's mostly for use in filenames because I already organize filenames this way.

The format is YYmDD, where YY is the last two digits of the year, m is a single character for the month, and DD is two digits making up the day.

The months are alphabet characters, with the letter corresponding to a month. It uses a-l, with `a` being January, and `l` being December, and months corresponding to the letters' position in the alphabet. It assumes lowercase letters for ordering purposes.

It also assumes years after 2000 because I wasn't creating digital content before then. 

### Example:

```
19b20 -> February 20th, 2019.
15k01 -> November 1st, 2001.
```