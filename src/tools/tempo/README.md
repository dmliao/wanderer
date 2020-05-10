# Tempo

Date format, mostly for use in filenames because I already organize filenames this way.

The format is YYmDD, where YY is the last two digits of the year, m is a single character for the month, and DD is two digits making up the day.

The months are alphabet characters, with the letter corresponding to a month. It uses a-l, with `a` being January, and `l` being December, and months corresponding to the letters' position in the alphabet. It assumes lowercase letters for ordering purposes.

It also assumes years after 2000 because I wasn't creating digital content before then. 

## Usage

```
const tempo = require('tempo')

const str = '19a01'
console.log(tempo.isTempoString(str)) // true
console.log(tempo.parse(str)) // creates a Date for January 1 2019.
```