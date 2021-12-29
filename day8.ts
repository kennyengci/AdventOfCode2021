import { readAndSplitTxtFile } from './libs'

let input = readAndSplitTxtFile('day8.txt')

const EASY_DIGITS = [2, 4, 3, 7] // 1, 4, 7 or 8
const DELIMITER = '|'

let easyDigitCount = 0
input.forEach(x => {
    const digits = x.split(' ')
    const outputDigits = digits.splice(digits.findIndex(x => x === DELIMITER) + 1)

    outputDigits.forEach(d => {
        const charCount = d.length
        if (EASY_DIGITS.includes(charCount)) easyDigitCount++
    })
})

console.log('Part 1: ', easyDigitCount)

// define our 7 segments
//     _1_
// 0 |     | 2
//     _3_
// 4 |     | 6
//     _5_

// this means every number 0 to 8 must, when the segments are "summed", conform to the following result
// I tried to move numbers around the segment positions to end up with unique sums 
// but it didn't work. I think it probably doesn't matter much anyway
const CORRECT_SUM = new Map([
    [1, 8],
    [2, 15],
    [3, 17],
    [4, 11],
    [5, 15],
    [6, 19],
    [7, 9],
    [8, 21],
    [9, 17],
    [0, 18]
])

const DIGIT_MAP = new Map([
    ['012456', '0'],
    ['26', '1'],
    ['12345', '2'],
    ['12356', '3'],
    ['0236', '4'],
    ['01356', '5'],
    ['013456', '6'],
    ['126', '7'],
    ['0123456', '8'],
    ['012356', '9']
])

const EasyDigitCountMap = new Map([
    [2, 1],
    [4, 4],
    [3, 7],
    [7, 8]
])


// process each unique digit (1, 4, 7, 8) and store their possible values
//input = [input[0]] //testing
const answers = [] as number[]
input.forEach(x => {
    const data = x.split(' ')
    const observations = data.splice(0, data.findIndex(x => x === DELIMITER))
    const readValues = data.splice(data.findIndex(x => x === DELIMITER) + 1)

    //console.log('observations', observations)
    //console.log('readValues', readValues)

    // for one input, "combinations" defines the possible permutations of a configuration
    const combinations = {} as Record<Digits, string[]>
    observations.forEach(o => {
        const segCount = o.length
        if (EASY_DIGITS.includes(segCount)) {
            // there should always be a resulting segmentNumber
            const segmentNumber = EasyDigitCountMap.get(segCount) as Digits
            combinations[segmentNumber] = o.split('')
        }
    })
    //console.log('combinations', combinations)

    // we need to generate all possible mappings from the given combination object
    const possibleConfigs = generatePossibleConfigs(combinations)
    //console.log('possibleConfigs', possibleConfigs)

    // for each possible config, hydrate with numbers and test if it sums to ANSWER_SUM, if it does, that is the correct mapping
    // then we add those values into our answer sum
    let answerNumber = 0
    for (let i = 0; i < possibleConfigs.length; i++) {
        const configToTest = possibleConfigs[i]
        const configKeys = Object.keys(configToTest)
        const configValues = Object.values(configToTest)
        const mappings = new Map(configValues.map((x, i) => [x, configKeys[i]]))
        //console.log('mappings', mappings)

        const testSums = [] as number[]
        for (let ii = 0; ii < observations.length; ii++) {
            const ob = observations[ii] // e.g. fdeba

            let letterGroupSum = 0
            for (let iii = 0; iii < ob.length; iii++) {
                const letter = ob[iii]

                const letterValue = mappings.get(letter) ?? '-999' // bootleg error
                letterGroupSum += Number.parseInt(letterValue)
            }

            testSums.push(letterGroupSum)
        }

        // see if testSums matches CORRECT_SUM
        const testSumsSorted = testSums.sort()
        const correctSumSorted = Array.from(CORRECT_SUM.values()).sort()
        //console.log('testSumsSorted', testSumsSorted, 'correctSumSorted', correctSumSorted)
        let isMatch = true
        correctSumSorted.forEach((c, i) => {
            const testSumValue = testSumsSorted[i]
            if (testSumValue !== c) {
                isMatch = false
            }
        })

        // use the current possibleConfig to determine the answer sum
        if (isMatch) {
            let readNumber = ''
            readValues.forEach(r => {
                const letterValues = [] as number[]
                for (let index = 0; index < r.length; index++) {
                    const letter = r[index];
                    const letterValue = mappings.get(letter) ?? '-999'
                    letterValues.push(Number.parseInt(letterValue))
                }

                const letterValuesSortedStringed = letterValues.sort().reduce((acc, curr) => {
                    return acc += curr.toString()
                }, '')

                const matchingDigit = DIGIT_MAP.get(letterValuesSortedStringed) ?? ''
                readNumber += matchingDigit
            })

            // parse
            answerNumber = Number.parseInt(readNumber)
            answers.push(answerNumber)
        }

        //console.log('configToTest', configToTest, 'testSums', testSums)
    }
})

//console.log('answers', answers)
const answersSummed = answers.reduce((acc, curr) => acc + curr, 0)
console.log('Part 2: ', answersSummed)

function generatePossibleConfigs(combinations: Record<Digits, string[]>): PossibleConfig[] {
    const output = [] as PossibleConfig[]

    // preprocessing
    const oneLetters = [...combinations[1]]
    const fourLetters = combinations[4].filter(x => !oneLetters.includes(x))
    const sevenLetters = combinations[7].filter(x => !fourLetters.includes(x) && !oneLetters.includes(x))
    const eightLetters = combinations[8].filter(x => !sevenLetters.includes(x) && !fourLetters.includes(x) && !oneLetters.includes(x))

    // looping through 1, 4, 7 and 8 possibilities should leave us with all unique combinations of a digit configuration
    let one = oneLetters
    let four = fourLetters
    let seven = sevenLetters
    let eight = eightLetters

    for (let oi = 0; oi < oneLetters.length; oi++) {
        const o = oneLetters[oi]

        const possibleConfig = {} as PossibleConfig

        possibleConfig[2] = o
        const leftoverOne = one.find(x => x !== o) ?? ''
        possibleConfig[6] = leftoverOne

        for (let fi = 0; fi < fourLetters.length; fi++) {
            const f = fourLetters[fi];

            possibleConfig[0] = f
            const leftoverFour = four.find(x => x !== f) ?? '' // should be the only element remaining
            possibleConfig[3] = leftoverFour

            for (let si = 0; si < sevenLetters.length; si++) { // There is no need to loop for seven in retrospect...
                const s = sevenLetters[si];

                possibleConfig[1] = s

                for (let ei = 0; ei < eightLetters.length; ei++) {
                    const e = eightLetters[ei];

                    possibleConfig[5] = e
                    const leftoverEight = eight.find(x => x !== e) ?? '' // again should only have one remaining letter after higher loops
                    possibleConfig[4] = leftoverEight

                    output.push({ ...possibleConfig })
                }
            }
        }
    }

    return output
}

interface PossibleConfig {
    0?: string,
    1?: string,
    2?: string,
    3?: string,
    4?: string,
    5?: string,
    6?: string,
    7?: string,
    8?: string
}

type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

