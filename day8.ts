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

console.log('part1', easyDigitCount)

// define our 7 segments
//     _1_
// 0 |     | 2
//     _3_
// 4 |     | 6
//     _5_

// this means every number 0 to 8 must, when the segments are "summed", conform to the following result
// I tried to move numbers around the segment positions to end up with unique sums 
// but it didn't work. I think it probably doesn't matter much anyway
const POSSIBLE_SUMS = new Map([
    [1, 8],
    [2, 15],
    [3, 17],
    [4, 11],
    [5, 15],
    [6, 19],
    [7, 9],
    [8, 21],
    [0, 18]
])

const EasyDigitCountMap = new Map([
    [2, 1],
    [4, 4],
    [3, 7],
    [7, 8]
])


// process each unique digit (1, 4, 7, 8) and store their possible values
input = [input[0]]
input.forEach(x => {
    const data = x.split(' ')
    const observations = data.splice(0, data.findIndex(x => x === DELIMITER))

    console.log(observations)

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
    console.log('combinations', combinations)

    // we need to generate all possible mappings from the given combination object
    const possibleConfigs = generatePossibleConfigs(combinations)
    
    console.log('possibleConfigs', possibleConfigs)
})

function generatePossibleConfigs(combinations: Record<Digits, string[]>): PossibleConfig[] {
    const output = [] as PossibleConfig[]

    // looping through 1, 4, 7 and 8 possibilities should leave us with all unique combinations of a digit configuration
    let one = combinations[1]
    let four = combinations[4]
    let seven = combinations[7]
    let eight = combinations[8]

    combinations[1].forEach(o => {
        const possibleConfig = {} as PossibleConfig

        // assign letter to the spot it could belong to
        // order matters here, we are using leftover letters to fill the other possible spot
        // at the end of these loops we should have all spots filled out based on elimination
        possibleConfig[2] = o
        exhaustLetter(o, 1)
        const leftover = one[0]
        possibleConfig[6] = leftover
        exhaustLetter(leftover, 1)

        combinations[4].forEach(f => {
            if (!four.includes(f)) {
                // continue next loop if the current letter has already been used up
                return 
            }
            possibleConfig[0] = f
            exhaustLetter(f, 4)
            const leftover = four[0] // should be the only element remaining
            possibleConfig[3] = leftover
            exhaustLetter(leftover, 4)

            combinations[7].forEach(s => {
                if (!seven.includes(s)) {
                    // continue next loop if the current letter has already been used up
                    return 
                }
                possibleConfig[1] = s
                exhaustLetter(s, 7)

                combinations[8].forEach(e => {
                    if (!eight.includes(e)) {
                        // continue next loop if the current letter has already been used up
                        return 
                    }
                    possibleConfig[5] = e
                    exhaustLetter(e, 8)
                    const leftover = eight[0] // again should only have one remaining letter after higher loops
                    possibleConfig[4] = leftover

                    // no need to exhaust we are done
                    // refresh all letters for next round of loops
                    refreshLetters()
                    output.push(possibleConfig)
                })
            })
        })
    })

    return output

    function exhaustLetter(letterToRemove: string, level: number){
        if (level === 8) {
            if (eight.indexOf(letterToRemove) >= 0) eight.splice(eight.indexOf(letterToRemove), 1)
        }
        if (level === 7) {
            if (seven.indexOf(letterToRemove) >= 0) seven.splice(seven.indexOf(letterToRemove), 1)
            if (eight.indexOf(letterToRemove) >= 0) eight.splice(eight.indexOf(letterToRemove), 1)
        }
        if (level === 4) {
            if (four.indexOf(letterToRemove) >= 0) four.splice(four.indexOf(letterToRemove), 1)
            if (seven.indexOf(letterToRemove) >= 0) seven.splice(seven.indexOf(letterToRemove), 1)
            if (eight.indexOf(letterToRemove) >= 0) eight.splice(eight.indexOf(letterToRemove), 1)
        }
        if (level === 1) {
            if (one.indexOf(letterToRemove) >= 0) one.splice(one.indexOf(letterToRemove), 1)
            if (four.indexOf(letterToRemove) >= 0) four.splice(four.indexOf(letterToRemove), 1)
            if (seven.indexOf(letterToRemove) >= 0) seven.splice(seven.indexOf(letterToRemove), 1)
            if (eight.indexOf(letterToRemove) >= 0) eight.splice(eight.indexOf(letterToRemove), 1)
        }
    }

    function refreshLetters() {
        one = combinations[1]
        four = combinations[4]
        seven = combinations[7]
        eight = combinations[8]
    }
}


// cant remember what I was trying to do here
function parseCombinations(combinations: Record<Digits, string[]>): PossibleConfig[] {
    const output = [] as PossibleConfig[]

    // while any digit property in the initial combinations object has more than one letter in it's array of possibilities
    // then there are still possible configurations to generate
    [1, 4, 7, 8].forEach(n => {
        const nDigit = n as Digits
        while (combinations[nDigit].length > 1) {
            const nDigitLetter = combinations[nDigit][0]

            const possibleConfig: PossibleConfig = {}
            switch (nDigit) {
                case 1:
                    if (!possibleConfig[2]) possibleConfig[2] = nDigitLetter
                    else possibleConfig[6] = nDigitLetter
                    break;
                case 4:
                    if (!possibleConfig[0]) possibleConfig[0] = nDigitLetter
                    else possibleConfig[3] = nDigitLetter
                case 7: possibleConfig[1] = nDigitLetter
                case 8:
                    if (!possibleConfig[4]) possibleConfig[4] = nDigitLetter
                    else possibleConfig[5] = nDigitLetter
                default:
                    break;
            }
        }
    })

    return output
}

// interface ConfigCombinations {
//     0?: string[],
//     1?: string[],
//     2?: string[],
//     3?: string[],
//     4?: string[],
//     5?: string[],
//     6?: string[],
//     7?: string[],
//     8?: string[]
// }


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

