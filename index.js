const puppeteer = require('puppeteer');
const readline = require('readline');

(async () => {
    const DIR = {
        email: 'leo.shi@student.masada.nsw.edu.au',  // replace YOUR EMAIL with your email for auto login (keep everything else the same)
        password: 'Leocaifu2001',  // replace YOUR PASSWORD with your password for auto login

        login_url: 'https://app.educationperfect.com/app/login',

        // log-in page elements
        username_css: '#loginId',
        password_css: '#password',

        // home page elements
        home_css: 'div.view-segment-dashboard',

        // task-starter page elements
        baseList_css: 'div.baseLanguage',
        targetList_css: 'div.targetLanguage',
        start_button_css: 'button#start-button-main',

        // task page elements
        modal_question_css: 'td#question-field',
        modal_correct_answer_css: 'td#correct-answer-field',
        modal_user_answered_css: 'td#users-answer-field',
        modal_css: 'div[uib-modal-window=modal-window]',
        modal_backdrop_css: 'div[uib-modal-backdrop=modal-backdrop]',

        question_css: '#question-text',
        answer_box_css: 'input#answer-text',

        exit_button_css: 'button.exit-button',
        exit_continue_button_css: 'button.continue-button',

        continue_button_css: 'button#continue-button',
    }

    // launch browser
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        handleSIGINT: false
    });

    const page = (await browser.pages())[0];

    // Open EP page and log in
    console.log('Starting EP page...');
    await page.goto(DIR.login_url);
    console.log('Waiting login page...');
    await page.waitForSelector(DIR.username_css);

    // THIS FILLS IN YOUR DETAILS TO LOG IN AUTOMATICALLY
    console.log('Filling in login details...');
    await page.type(DIR.username_css, DIR.email);
    await page.type(DIR.password_css, DIR.password);
    await page.keyboard.press('Enter');

    console.log('Waiting for home page to load...');
    // await page.waitForSelector(DIR.home_css, { timeout: 0 });
    console.log('EP Home page loaded; Logged in.');

    // ===== Auto-answer code starts here ===== //
    let TOGGLE = false;
    let ENTER = true;
    let fullDict = {};
    let cutDict = {};

    // Basic answer-parsing
    function cleanString(string) {
        return String(string)
            .replace(/\([^)]*\)/g, "").trim()
            .split(";")[0].trim()
            .split(",")[0].trim()
            .split("|")[0].trim();
    }

    // Get words from the main task page
    async function wordList(selector) {
        return await page.$$eval(selector, els => {
            let words = [];
            els.forEach(i => words.push(i.textContent));
            return words;
        });
    }

    // Refreshes the world lists on the main task page to enhance our vocabulary
    async function refreshWords() {
        const l1 = await wordList(DIR.baseList_css);
        const l2 = await wordList(DIR.targetList_css);
        for (let i = 0; i < l1.length; i++) {
            fullDict[l2[i]] = cleanString(l1[i]);
            fullDict[l1[i]] = cleanString(l2[i]);
            cutDict[cleanString(l2[i])] = cleanString(l1[i]);
            cutDict[cleanString(l1[i])] = cleanString(l2[i]);
        }
        console.log('Word Lists Refreshed.');
        console.log('Full Dictionary:', JSON.stringify(fullDict, null, 2)); // 格式化输出 fullDict
    }

    // extracts what (EP detected as) the user typed, from the fancy multicolored display
    // appended to logs for debugging/self-learning purposes
    async function getModalAnswered() {
        return await page.$$eval('td#users-answer-field > *', el => {
            let answered = '';
            el.forEach(i => {
                if (i.textContent !== null && i.style.color !== 'rgba(0, 0, 0, 0.25)') answered = answered + i.textContent;
            })
            return answered;
        });
    }

    // Learn from the mistakes :)
    async function correctAnswer(question, answer) {
        // wait until modal content is fully loaded
        await page.waitForFunction((css) => {
            return document.querySelector(css).textContent !== "blau";
        }, {}, DIR.modal_question_css);

        // extract modal contents (for debugging and correcting answers)
        let modalQuestion = await page.$eval(DIR.modal_question_css, el => el.textContent);
        let modalAnswer = await page.$eval(DIR.modal_correct_answer_css, el => el.textContent);
        let modalCutAnswer = cleanString(modalAnswer);
        let modalAnswered = await getModalAnswered();

        // dismisses the modal (bypasses the required cooldown)
        await page.$eval(DIR.continue_button_css, el => el.disabled = false);
        await page.click(DIR.continue_button_css);

        // update/correct answer dictionary
        fullDict[question] = modalCutAnswer;

        // logging for debugging if needed
        let log = "===== Details after Incorrect Answer: =====\n"
        log = log + `Detected Question: \n => ${question}\n`;
        log = log + `Inputted Answer: \n => ${answer}\n\n`;
        log = log + `Modal Question: \n => ${modalQuestion}\n`;
        log = log + `Modal Full Answer: \n => ${modalAnswer}\n`;
        log = log + `Modal Cut Answer: \n => ${modalCutAnswer}\n`;
        log = log + `Modal Detected Answered: \n => ${modalAnswered}\n\n\n`;

        console.log(log);
    }

    // deletes all existing modals and backdrops. Used to force-speed things up
    async function deleteModals() {
        await page.$$eval(DIR.modal_css, el => {
            el.forEach(i => i.remove())
        });
        await page.$$eval(DIR.modal_backdrop_css, el => {
            el.forEach(i => i.remove())
        });
    }

    // very advanced logic (ofc) used to find matching answer
    function findAnswer(question) {
        console.log('Original question:', question);
        let cleanedQuestion = cleanString(question);
        console.log('Cleaned question:', cleanedQuestion);

        // Try direct match first
        let answer = fullDict[question];
        if (answer) {
            console.log('Found direct match in fullDict');
            return answer;
        }

        // Try with cleaned question
        answer = fullDict[cleanedQuestion];
        if (answer) {
            console.log('Found cleaned match in fullDict');
            return answer;
        }

        // Try with comma replaced by semicolon
        answer = fullDict[question.replace(/,/g, ";")];
        if (answer) {
            console.log('Found comma-replaced match in fullDict');
            return answer;
        }

        // Try cutDict with cleaned question
        answer = cutDict[cleanedQuestion];
        if (answer) {
            console.log('Found match in cutDict');
            return answer;
        }

        // Try reverse lookup in cutDict
        for (let key in cutDict) {
            if (cleanString(key) === cleanedQuestion) {
                console.log('Found match through reverse lookup in cutDict');
                return cutDict[key];
            }
        }

        console.log('No answer found for:', question);
        console.log('Current fullDict:', JSON.stringify(fullDict, null, 2));
        console.log('Current cutDict:', JSON.stringify(cutDict, null, 2));
        return generateRandomString(8, 10);
    }

    // i love creating functions so here's one for the random string instead of just returning idk answer
    // -joshatticus
    function generateRandomString(minLength, maxLength) {
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    async function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // main function that continually answers questions until completion modal pops up or hotkey pressed again
    async function answerLoop() {
        if (TOGGLE) throw Error("Tried to initiate answerLoop while it is already running");

        TOGGLE = true;
        console.log("answerLoop entered.");

        while (TOGGLE) {
            let question = await page.$eval(DIR.question_css, el => el.textContent);
            let answer = findAnswer(question);

            await page.click(DIR.answer_box_css, { clickCount: 3 });
            await page.keyboard.sendCharacter(answer);
            //await wait(50); // 等待0.05秒，可变
            ENTER && page.keyboard.press('Enter');


            // special case: modal pops up
            if (await page.$(DIR.modal_css)) {
                // incorrect answer and modal pops up; initiate answer-correction procedure
                if (await page.$(DIR.modal_question_css) !== null) {
                    await correctAnswer(question, answer);
                    await deleteModals();
                    // list complete; clicks button to exit
                } else if (await page.$(DIR.exit_button_css)) {
                    await page.click(DIR.exit_button_css);
                    break;
                } else if (await page.$(DIR.exit_continue_button_css)) {
                    await page.click(DIR.exit_continue_button_css);
                    break;
                } else {
                    // no idea what the modal is for so let's just pretend it doesn't exist
                    await deleteModals();
                }
            }
        }

        await deleteModals();
        TOGGLE = false;
        console.log('answerLoop Exited.');
    }

    // takes care of answerLoop toggling logic
    async function toggleLoop() {
        if (TOGGLE) {
            TOGGLE = false;
            console.log("Stopping answerLoop.");
        } else {
            console.log("Starting answerLoop.");
            answerLoop().catch(e => {
                console.error(e);
                TOGGLE = false
            });
        }
    }

    async function toggleAuto() {
        if (ENTER) {
            ENTER = false;
            console.log("Switched to semi-auto mode.");
        } else {
            ENTER = true;
            console.log("Switched to auto mode.");
        }
    }

    async function alert(msg) {
        await page.evaluate(m => window.alert(m), msg);
    }

    // Expose API functions to the page (for hotkey event listeners to call)
    await page.exposeFunction('refresh', refreshWords);
    await page.exposeFunction('startAnswer', toggleLoop);
    await page.exposeFunction('toggleMode', toggleAuto);

    // Add event listeners for hotkeys ON the page
    await page.evaluate(() => {
        document.addEventListener("keyup", async (event) => {
            console.log("Key:", event.key);
            console.log("Alt key pressed:", event.altKey);

            let key = event.key.toLowerCase();
            if (key !== 'alt') {
                if ((event.altKey && key === "r") || (key === "®")) {
                    await window.refresh();
                } else if ((event.altKey && key === "s") || (key === "ß")) {
                    await window.startAnswer();
                } else if ((event.altKey && key === "a") || (key === "å")) {
                    await window.toggleMode();
                }
            }
        });
    });

    console.log('Education Perfected V2 fully Loaded.');

    // Terminal input listener
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', async (input) => {
        switch (input.trim()) {
            case 'refresh':
                await refreshWords();
                break;
            case 'start':
                await toggleLoop();
                break;
            case 'toggle':
                await toggleAuto();
                break;
            case 'exit':
                rl.close();
                await browser.close();
                process.exit();
                break;
            default:
                console.log('Unknown command');
                break;
        }
    });

    console.log('Terminal commands: refresh, start, toggle, exit');
})();