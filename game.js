const readline = require('readline');
const fs = require('fs');
const statusEnum = require('./statusEnum');
const difficultyEnum = require('./difficultyEnum');
const { readFile, writeFile } = require('fs').promises;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let hearth = 1
let difficulty = 0
let randomWord = ""
let leaderBoard = [];
let point = 0


function menu() {
    console.log("\n<---------WELCOME TO THE HANGMAN GAME--------->")
    console.log("1. NEW GAME")
    console.log("2. LEADERBOARD")
    console.log("3. QUIT")
    console.log("<--------------------------------------------->")

    rl.question("Select an option: ", (answer) => {
        switch (Number(answer)) {
            case statusEnum.GAME:
                game();
                break;

            case statusEnum.LEADERBOARD:
                console.log("Leaderboard seçildi.")
                const board = fs.readFileSync('leaderBoard.json', 'utf8');

                if (board.trim() === "") {
                    console.log("Leaderboard şu anda boş.");
                    menu();
                } else {
                    leaderBoard = JSON.parse(board);
                    console.log("<--------------------------------------------->")
                    leaderBoard.forEach((player, index) => {
                        const name = player.name;
                        const score = String(player.score);
                        console.log(`${index + 1}. ${name} | ${score} points`);
                    })
                    console.log("<--------------------------------------------->")
                    rl.question("Press 'm' for menu or 'q' to quit: ", (key) => {
                        const choice = key.toLowerCase();
                        if (choice === "m") {
                            menu();
                        } else if (choice === "q") {
                            console.log("Closing...");
                            rl.close();
                        } else {
                            console.log("Invalid input. Returning to menu...");
                            menu();
                        }
                    })
                }
                break;
            case statusEnum.QUIT:
                console.log("Closing...")
                rl.close();
                break;
            default:
                console.log("Invalid input, please select a valid option")
                menu();
        }
    });
}



function game() {
    x = 0;
    i = 0;
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
        } else {
            console.log("Invalid difficulty please select valid difficulty");
            game();
        }
    })
}

function createWord() {
    let filePath;

    switch (difficulty) {
        case difficultyEnum.EASY:
            filePath = 'data/easy.txt';
            break;
        case difficultyEnum.MEDIUM:
            filePath = 'data/medium.txt';
            break;
        case difficultyEnum.HARD:
            filePath = 'data/hard.txt';
            break;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    arr = data.split('\n');
    const randomIndex = Math.floor(Math.random() * arr.length);
    randomWord = arr[randomIndex];
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

let guessedLetters = [];

function gameLoop() {
    guessedLetters = []
    askGuess();
}


function askGuess() {
    console.log("<--------------------------------------------->")
    console.log(`Lives left: ${hearthAnimation(hearth)}`);
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
                danceAnimation();
            } else {
                askGuess();
            }
        } else {
            hearth--;
            console.log("Wrong!");

            if (hearth <= 0) {
                animateHangman();
            } else {
                askGuess();
            }
        }
    });
}

function calculatePoints(callback) {
    switch (difficulty) {
        case difficultyEnum.EASY:
            point = randomWord.length * hearth * 30
            break;
        case difficultyEnum.MEDIUM:
            point = randomWord.length * hearth * 100
            break;
        case difficultyEnum.HARD:
            point = randomWord.length * hearth * 250
            break;
    }

    console.log(`Point: ${point}`)
    leaderBoardWriter(callback);
}

function leaderBoardWriter(callback) {
    let existingData = [];
    const fileContent = fs.readFileSync('leaderBoard.json', 'utf8')
    if (fileContent.trim()) {
        existingData = JSON.parse(fileContent);
    }

    rl.question("Write your name: ", (playerName) => {
        existingData.push({ name: playerName, score: point });
        for (let i = 0; i < existingData.length; i++) {
            for (let j = i + 1; j < existingData.length; j++) {
                if (existingData[j].score > existingData[i].score) {
                    let temp = existingData[i];
                    existingData[i] = existingData[j];
                    existingData[j] = temp;
                }
            }
        }
        fs.writeFileSync('leaderBoard.json', JSON.stringify(existingData, null, 2));
        callback();
    })
}

const term = require('terminal-kit').terminal;

const frames = [
    `
     +---+
         |
         |
         |
         |
         |
    =========`,
    `
     +---+
     |   |
     O   |
         |
         |
         |
    =========`,
    `
     +---+
     |   |
     O   |
     |   |
         |
         |
    =========`,
    `
     +---+
     |   |
     O   |
    /|   |
         |
         |
    =========`,
    `
     +---+
     |   |
     O   |
    /|\\  |
         |
         |
    =========`,
    `
     +---+
     |   |
     O   |
    /|\\  |
    /    |
         |
    =========`,
    `
     +---+
     |   |
    💀   |
    /|\\  |
    / \\  |
         |
    =========`
];

let i = 0;
const animateHangman = () => {
    if (i < frames.length) {
        term.clear();
        term.eraseDisplay();
        term.red(frames[i]);
        i++;
        setTimeout(animateHangman, 500);
    } else {
        term.bold.red("\n💀 GAME OVER\n");
        term.green(`The word was: ${randomWord}`);
        menu();
    }
};

const danceFrames = [
    `
     \\😜/
      |
     / \\`,
    `
      😜
     /|\\
     / \\`,
    `
     \\😜
      |\\
     / \\`,
    `
     \\😜/
      |
     / \\`,
    `
      😜
     /|\\
     / \\`,
    `
     \\😜
      |\\
     / \\`
];

let x = 0;
function danceAnimation() {
    if (x < danceFrames.length) {
        term.clear();
        term.eraseDisplay();
        term.red(danceFrames[x]);
        x++;
        setTimeout(danceAnimation, 500);
    } else {
        term.clear();
        term.yellow('\n🎉 YOU WON! 🕺💃');
        term.green(`\nThe word was: ${randomWord} \n`);
        calculatePoints(menu);
    }
}

function hearthAnimation(hearth) {
    const heart = '❤️ ';
    return heart.repeat(Number(hearth));
}

menu()
