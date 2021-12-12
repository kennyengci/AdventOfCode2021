import { readAndSplitTxtFile } from './libs'

let input = readAndSplitTxtFile('day8.txt')

const EASY_DIGITS = [2, 4, 3, 7] // 1, 4, 7 or 8
const DELIMITER = '|'

let easyDigitCount = 0
// input = [input[0]]
input.forEach(x => {
    const digits = x.split(' ')
    const outputDigits = digits.splice(digits.findIndex(x => x === DELIMITER) + 1)

    console.log(x)
    console.log(digits)
    console.log(outputDigits)
    outputDigits.forEach(d => {
        const charCount = d.length
        if (EASY_DIGITS.includes(charCount)) easyDigitCount++
    })
})

console.log(easyDigitCount)