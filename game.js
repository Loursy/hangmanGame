const readline = require('readline');
const fs = require('fs');

const { readFile, writeFile } = require('fs').promises;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let hearth = 1
let difficulty = 0
let randomWord = ""

function menu() {
    console.log("<---------WELCOME TO THE HANGMAN GAME--------->")
    console.log("1. NEW GAME")
    console.log("2. LEADERBOARD")
    console.log("3. QUIT")
    console.log("<--------------------------------------------->")

    rl.question("Select an option: ", (answer) => {
        if (answer === "1") {
            game();
        } else if (answer === "2") {
            console.log("Leaderboard seçildi.")
            menu();
        } else if (answer === "3") {
            console.log("quit")
            rl.close();
        } else {
            console.log("Invalid input, please select a valid option")
            menu();
        }
    });
}

function game() {
    console.log("<--------------------------------------------->")
    console.log("1. EASY")
    console.log("2. MEDIUM")
    console.log("3. HARD")
    rl.question("Select difficulty: ", (number) => {
        if (number === "1") {
            console.log("Easy mode selected.")
            difficulty = 1;
            hearth = 5
            createWord();
            gameLoop()
        } else if (number === "2") {
            console.log("Medium mode selected.")
            difficulty = 2;
            hearth = 4
            createWord()
            gameLoop()
        } else if (number === "3") {
            console.log("Hard mode selected.")
            difficulty = 3
            hearth = 3
            createWord()
            gameLoop()
        }
    })
}

function createWord() {
    if (difficulty === 1) {
        const data = fs.readFileSync('data/easy.txt', 'utf8');
        arr = data.split("\n")
        const randomIndex = Math.floor(Math.random() * arr.length)
        randomWord = arr[randomIndex];

    } else if (difficulty === 2) {
        const data = fs.readFileSync('data/medium.txt', 'utf8');
        arr = data.split("\n")
        const randomIndex = Math.floor(Math.random() * arr.length)
        randomWord = arr[randomIndex];

    } else if (difficulty === 3) {
        const data = fs.readFileSync('data/hard.txt', 'utf8');
        arr = data.split("\n")
        const randomIndex = Math.floor(Math.random() * arr.length)
        randomWord = arr[randomIndex];
    }
}

function maskWord(randomWord, guessedLetters) {
    let masked = '';
    for (let i = 0; i < randomWord.length; i++) {
        if (guessedLetters.includes(randomWord[i])) {
            masked += randomWord[i] + ' '
        } else {
            masked += '_ ';
        }
    }
    return masked.trim();
}


function gameLoop() {
    let guessedLetters = [];

    function askGuess() {
        console.log(`Lives left: ${hearth}`);
        console.log(`Guessed letters: ${guessedLetters.join(', ')}`);
        console.log(`Word: ${maskWord(randomWord, guessedLetters)}`);

        rl.question("Guess a letter: ", (letter) => {
            letter = letter.toLowerCase();

            if (letter.length !== 1 || !/[a-z]/.test(letter)) {
                console.log("Please enter a single valid letter.");
                askGuess();
                return;
            }

            if (guessedLetters.includes(letter)) {
                console.log("You already guessed that letter.");
                askGuess();
                return;
            }

            guessedLetters.push(letter);

            if (randomWord.includes(letter)) {
                console.log("Correct!");
                const masked = maskWord(randomWord, guessedLetters);
                if (!masked.includes('_')) {
                    console.log(`🎉 You won! The word was: ${randomWord}`);
                    menu();
                } else {
                    askGuess();
                }
            } else {
                hearth--;
                console.log("Wrong!");

                if (hearth <= 0) {
                    console.log(`💀 Game over! The word was: ${randomWord}`);
                    menu();
                } else {
                    askGuess();
                }
            }
        });
    }
    askGuess();
}

menu()
