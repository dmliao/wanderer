const getMonthNumber = (s) => s.toLowerCase().charCodeAt(0) - 97

const isTempoString = (string) => {
	return /^[0-9][0-9][a-l][0-9]?[0-9]$/.test(string)
}

const parse = (tempoString) => {
	// validate tempoString
	if (!isTempoString(tempoString)) {
		throw new Error('invalid tempo string format.')
	}

	const year = parseInt(tempoString.slice(0, 2), 10)
	const month = getMonthNumber(tempoString[2])
	const day = parseInt(tempoString.slice(3), 10)

	return new Date(2000 + year, month, day)
}

module.exports = { parse, isTempoString }
