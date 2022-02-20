import './App.css';
import { DICTIONARY, DICTIONARY_EXTENDED } from './Dictionary.js'
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap'



const GAME_STATE_INIT = 0;
const GAME_STATE_ACTIVE = 1;
const GAME_STATE_END = 3;

// Global constants seem fine, since they will never change, they have nothing to do with state or re-rendering events
const WORD_LENGTH = 5;
const NUM_GUESSES = 6;
const ROUND_TIME = 30;
const DAILY_MODE_DAY_1 = "02/10/2022"; // The first day of daily mode
const DEV_MODE = true;
const MAX_WINS = 5;




function ScoreBoard({ gameData, setgameData, seconds, setSeconds }) {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);



  // TIMER STUFF
  const [date, setDate] = useState(new Date());

  //Replaces componentDidMount and componentWillUnmount
  // Avoid memory leaks?  TOLEARN: learn more about useEffect.
  useEffect(() => {
    var timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  });

  function tick() {
    setDate(new Date());
  }



  const getDateString = (dateIn) => {
    if (dateIn === '' || dateIn == null) return "";
    return dateIn.toLocaleTimeString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  const getTimeLeft = (date) => {
    if (date != null && date !== '') {
      let tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      let diff = tomorrow - date; // difference in ms

      if (diff <= 0) {
        return "Ready Now!"
      }

      let secondsLeft = Math.round(diff / 1000); // convert to seconds
      let hoursDisp = Math.floor(secondsLeft / 3600);
      let minutesDisp = Math.floor((secondsLeft - (hoursDisp * 3600)) / 60);
      let secondsDisp = (secondsLeft - (hoursDisp * 3600) - (minutesDisp * 60));

      return String(hoursDisp).padStart(2, '0') + ":" + String(minutesDisp).padStart(2, '0') + ":" + String(secondsDisp).padStart(2, '0');
    }
    else {
      return ""
    }
  }


  const [clickMessage, setclickMessage] = useState("Click to copy results to clipboard");

  function copyToClipBoard() {


    if (DEV_MODE) {
      // Also clear local data.
      localStorage.removeItem("gameData");
    }

    var results = "WordBlitz: " + gameData.dateFormatted;
    results += "\r\n"
    results += gameData.winCount + " Points";
    results += "\r\n"
    gameData.guessHistory.forEach((element) => {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (element[i].color === "G") {
          results += "🟩"
        }
        else if (element[i].color === "Y") {
          results += "🟨"
        }
        else if (element[i].color === "D") {
          results += "⬛"
        }
        else {
          if (DEV_MODE) {
            results += "X"
          }
          else {
            results += "⬛"
          }
          console.log("ERROR, history has invalid values: " + gameData)
        }
      }
      results += "\r\n"
    });
    if (gameData.gameState === GAME_STATE_END) {
      results += "+" + gameData.winTimeRemaining + "s Left!";
    }

    navigator.clipboard.writeText(results).then(function () {
      console.log('Async: Copying to clipboard was successful!');
      setclickMessage("Results copied to clipboard!");
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });

  }

  return (
    <Modal id="derp" show={seconds <= 0 || gameData.winCount >= MAX_WINS} onHide={handleClose}>
      <Modal.Header >
        <Modal.Title>WordBlitz </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>Game  #{gameData.gameID} {gameData.dateFormatted} </div>
        <div><b> Score: {gameData.winCount}</b></div>
        <div>The last word was: {gameData.actualWord}</div>
        <div> {gameData.winCount >= MAX_WINS ? <span>You got all the words with {seconds} seconds remaining</span> : null}</div>


      </Modal.Body>
      <Modal.Footer>
        <div className='container'>
          <div className='row'>
            <div className='col col-8'>
              <p>Next Game: {getTimeLeft(date)}</p>
            </div>
            <div className='col col-4' style={{ textAlign: 'right' }}>


              {['top'].map((placement) => (
                <OverlayTrigger
                  key={placement}
                  placement={placement}
                  overlay={
                    <Tooltip id={`tooltip-${placement}`}>
                      {clickMessage}
                    </Tooltip>
                  }
                >
                  <Button variant="success" onClick={copyToClipBoard}>Share &nbsp; <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-share" viewBox="0 0 16 16">
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                  </svg></Button>
                </OverlayTrigger>
              ))}

            </div>
          </div>
        </div>

      </Modal.Footer>
    </Modal>
  )
}


function Welcome({ gameData, setgameData, seconds, setSeconds }) {

  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (


    <Modal show={show && gameData.gameState === GAME_STATE_INIT} onHide={handleClose}>
      <Modal.Header >
        <Modal.Title>WordBlitz</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          <li>Try to solve as many word puzzles as you can in the allotted time.</li>
          <li>The timer will start as soon as you start typing!</li>
          <li>Type a 5 letter word and hit ↩ (Enter) to submit it</li>
          <li>
            <div>🟩 Perfect match</div>
            <div>🟨 Right letter, wrong location</div>
            <div>⬛ Letter not in word</div>
          </li>
        </ul>
        <div>A new puzzle will begin immediately after you solve the puzzle, each puzzle solved earns 1 point.</div>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Lets Play!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}


/*function RestartButton({ gameData, setgameData, seconds, setSeconds }) {

  // Finding it easier to repeat some functions rather than make them available to both methods.. 
  // This is probably bad practice.  
  function getRandWord() {

    return DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)].toUpperCase();
  }

  const resetGame = () => {
    setSeconds(ROUND_TIME);
    var localGameData = gameData;
    localGameData.actualWord = getRandWord();
    localGameData.currRow = 0;
    localGameData.currCol = 0;
    localGameData.gameState = 0;
    localGameData.winCount = 0;
    localGameData.guessMatrix = [['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']];

    setgameData(JSON.parse(JSON.stringify(localGameData)));
  }

  return (<button onClick={() => resetGame()} className='btn btn-primary' style={{ visibility: seconds === 0 ? 'visible' : 'hidden' }}>New Game</button>)

}*/

function Timer({ timeleft }) {
  var minutes = parseInt(timeleft / 60, 10);
  var seconds = parseInt(timeleft % 60, 10);

  return (<div>Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</div>)
}

function Wins({ gameData }) {
  return (<div>Points: {gameData.winCount} {DEV_MODE ? gameData.actualWord : ''}</div>)
}

function Alerts({ alert, seconds, gameData }) {

  var fade = "fadeIn";
  if (seconds < alert.timestamp) {
    fade = "fadeOut";
  }

  const getColor = () => {
    if (alert.type === 'invalid') {
      return "message alert alert-danger " + fade;
    }
    else if (alert.type === 'success') {
      return "message alert alert-success " + fade;
    }
    else {
      return "message alert alert-dark " + fade;
    }
  }
  // Stylistically dont like this
  if (seconds === ROUND_TIME) {
    alert.message = "";
    alert.type = ""
  }
  if (alert.message === "" || alert.message === null) {
    alert.message = " "
  }

  return (<div className={getColor()} style={{ visibility: alert.message.length > 1 ? 'visible' : 'hidden' }}>{alert.message}&nbsp;</div>);
}

function Title() {
  return (
    <h3>WordBlitz</h3>
  )
}

function KeyButton({ name, gameData, setgameData, inputHandler }) {

  const isPerfectlyMatched = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (thisLetter === gameData.actualWord.charAt(c) && thisLetter === gameData.guessMatrix[r][c].letter) {
          return true;
        }
      }
    }
    return false;
  }

  const isMatched = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (gameData.actualWord.includes(thisLetter) && thisLetter === gameData.guessMatrix[r][c].letter) {
          return true;
        }
      }
    }
    return false;
  }

  const isUsed = (thisLetter) => {
    for (var r = 0; r < gameData.currRow; r++) {
      for (var c = 0; c < WORD_LENGTH; c++) {
        if (thisLetter === gameData.guessMatrix[r][c].letter) {
          return true;
        }
      }
    }
    return false;
  }

  const getColor = (thisLetter) => {
    if (thisLetter !== '' && isPerfectlyMatched(thisLetter)) {
      return "key btn btn-success";
    }
    else if (thisLetter !== '' && isMatched(thisLetter)) {
      return "key btn btn-warning";
    }
    else if (isUsed(thisLetter)) {
      return "key btn btn-dark";
    }
    else {
      return "key btn btn-secondary";
    }
  }


  return (
    <button className={getColor(name)} onClick={() => inputHandler(name)}>{name}</button>

  )
}

function SpecialButton({ name, gameData, setgameData, inputHandler }) {

  const displayString = (mode) => {
    if (mode === "Backspace") {
      // I can just return this svg like this?   apparently..  is this bad?
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-backspace" viewBox="0 0 16 16">
        <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z" />
        <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z" />
      </svg>
    }
    if (mode === "Enter") {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-left" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z" />
      </svg>
    }

  }


  return (
    <button className="key btn btn-secondary" onClick={() => inputHandler(name)}>{displayString(name)}</button>

  )
}


function LetterBox(props) {

  var thisLetter = props.gameData.guessMatrix[props.row][props.column].letter;
  var thisColor = props.gameData.guessMatrix[props.row][props.column].color;
  //https://stackoverflow.com/questions/34833907/how-to-flip-the-div-using-css
  // maybe this ^
  const getClass = () => {
    var colorString = ""
    if (thisColor === "G") {
      colorString = "back face letterbox alert alert-success ";
    }
    else if (thisColor === "Y") {
      colorString = "back face letterbox alert alert-warning ";

    }
    else if (thisColor === "D") {
      colorString = "back face letterbox alert alert-dark ";
    }
    else {
      colorString = "back face letterbox alert alert-secondary ";
    }
    return colorString;
  }

// difference between p and div... use p to move text within the div??
  const getInContClass = () => {
    var colorString = "delay-" + (props.column) + " "
    if (thisColor === "G") {
      colorString += "LBInCont LBRot ";
    }
    else if (thisColor === "Y") {
      colorString += "LBInCont LBRot ";

    }
    else if (thisColor === "D") {
      colorString += "LBInCont LBRot ";
    }
    else {
      colorString += "LBInCont ";
    }
    return colorString;
  }

  // I cant concatinate the response of getColor to "alert alert-"
  return (
    <div className="col col-sm-2">
      <div className="LBCont ">
        <div className={getInContClass()}>
          <div className="front face letterbox alert alert-secondary "><p>{thisLetter}</p></div>
          <div className={getClass()}><p>{thisLetter}</p></div>
        </div>
      </div>
    </div>
  )
}

function GuessRow(props) {
  return (

    <div className="row  g-0 justify-content-sm-center">
      <LetterBox row={props.row} column="0" gameData={props.gameData} />
      <LetterBox row={props.row} column="1" gameData={props.gameData} />
      <LetterBox row={props.row} column="2" gameData={props.gameData} />
      <LetterBox row={props.row} column="3" gameData={props.gameData} />
      <LetterBox row={props.row} column="4" gameData={props.gameData} />
    </div>
  )
}

function App() {

  function random(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getRandWord(seed) {
    return DICTIONARY[Math.floor(random(seed) * DICTIONARY.length)].toUpperCase();
  }

  function isValidWord(word) {
    return DICTIONARY_EXTENDED.includes(word.toLowerCase());
  }



  const getDateString = () => {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    return month + "/" + day + "/" + year;
  }

  function getUniqueGameNumber(date2) {
    // Day 1 of WordBlitz Daily 
    var date1 = new Date(DAILY_MODE_DAY_1);

    // To calculate the time difference of two dates
    var Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Difference_In_Days;
  }

  const date = new Date(getDateString());
  const prettyDate = date.toLocaleDateString([], { month: "numeric", day: "numeric" });

  // Using 1 megaobject to control everything about the state of the game.  
  // It seems like for a bigger app you might want to isolate things, but this makes my life easy for now
  const [gameData, setgameData] = useState(() => {

    const savedGameData = localStorage.getItem("gameData");
    const initialValue = JSON.parse(savedGameData);
    //If we can find game data in local storage...  and that game data is the same game number as 
    //the current game... load the game data.   (deal with modal welcome issues?)
    if (initialValue != null && initialValue.gameID === getUniqueGameNumber(date)) {
      return initialValue;
    }
    else return {
      actualWord: getRandWord(getUniqueGameNumber(date) + 0),
      currRow: 0,
      currCol: 0,
      gameState: GAME_STATE_INIT,
      gameID: getUniqueGameNumber(date),
      date: date,
      dateFormatted: prettyDate,
      gameStartTime: null,
      winCount: 0,
      winTimeRemaining: null,
      guessMatrix: [[{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }]],
      guessHistory: []
    }

  });




  const [alert, setAlert] = useState({ message: "", type: "" });



  // TIMER STUFF
  const [seconds, setSeconds] = useState(ROUND_TIME);
  const [intervalID, setIntervalID] = useState(null)
  const hasTimerEnded = seconds <= 0
  const isTimerRunning = intervalID != null
  const update = () => {
    setSeconds(seconds => seconds - 1)
  }
  const startTimer = useCallback(() => {
    if (!hasTimerEnded && !isTimerRunning) {
      setSeconds(seconds => seconds - 1)
      setIntervalID(setInterval(update, 1000))
    }
  }, [hasTimerEnded, isTimerRunning])
  const stopTimer = useCallback(() => {
    clearInterval(intervalID)
    setIntervalID(null)
  }, [intervalID])
  // clear interval when the timer ends
  useEffect(() => {
    if (hasTimerEnded) {
      // TODO: Set game state here?  maybe not.. if we can use seconds=0 as a lose state.
      clearInterval(intervalID)
      setIntervalID(null)
    }
  }, [hasTimerEnded, intervalID])


  function secondsSince(date) {
    var currentTime = new Date();
    var dif = currentTime.getTime() - date.getTime();
    return Math.round(dif / 1000);
  }

  // TODO: KEEP TRACK OF GAME END TIMESTAMP??   
  //  If the game is ended... show the time the game ended on. // I dont have this info do i..
  // If the game is active, and the timer isnt started yet...  set seconds to the correct time left.. and start timer..  but only do this once..
  //      If there is 0 time left..  end of game should be handled.   If the end of game modal displays...  game state should go to end
  // If the game is init dont do anything.. \
  // seconds = 0 can be gamestate lose...      gamestate end should onyl mean win??
  const initTimer = useCallback(() => {

    console.log("Game state: " + gameData.gameState.name + " Started on: " + gameData.gameStartTime)

    console.log("Game state is active : " + (gameData.gameState === GAME_STATE_ACTIVE))
    if (gameData.gameState === GAME_STATE_END) {
      setSeconds(gameData.winTimeRemaining)
    }
    else if (gameData.gameState === GAME_STATE_ACTIVE) {
      console.log("Has timer ended: " + hasTimerEnded + " is timer running: " + isTimerRunning)
      if (gameData.gameStartTime !== null && !hasTimerEnded && !isTimerRunning) {
        var secondsLeft = ROUND_TIME - secondsSince(new Date(gameData.gameStartTime));
        console.log("Still game left: " + secondsLeft)
        if (secondsLeft > 0) {
          setSeconds(secondsLeft);
          startTimer();
        }
        else {
          console.log("no game left: " + secondsLeft)
          // Gamestate LOSE
          setSeconds(0);
        }
      }
    }
  }, [gameData, hasTimerEnded, isTimerRunning, startTimer]);


  useEffect(() => {
    initTimer(); // this will fire only on first render (THIS IS A LIE.. its firing all the time, its firing on every input change)
  }, [initTimer]);

  // If gameStartTime !== null
  // set seconds to difference (OR ZERO)
  // startTimer
  //  TODO:  ONLY WANT TO DO THIS ONCE.. ON PAGE LOAD
  /* useEffect(() => {
     console.log("doing this")
     if (gameData.gameStartTime !== null && !hasTimerEnded && !isTimerRunning) {
       var secondsLeft = ROUND_TIME - secondsSince(new Date(gameData.gameStartTime));
       if (secondsLeft > 0 && !hasTimerEnded && !isTimerRunning){
         setSeconds(secondsLeft);
         // Still game left
         if(gameData.winCount < MAX_WINS){
           startTimer();
         }
       }
       else if(secondsLeft <= 0){
         setSeconds(0);
       }
     }
   }, [gameData, startTimer, hasTimerEnded, isTimerRunning])*/

  // useCallback fixed issues here.   this is complex, do more research on this.
  // https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook
  // This turned out to be a mega function to accept input.  Should probably avoid this.
  const acceptInput = useCallback((input) => {

    function getRandWord(seed) {
      return DICTIONARY[Math.floor(random(seed) * DICTIONARY.length)].toUpperCase();
    }

    function newRound() {
      var localGameData = gameData;
      console.log(localGameData);
      localGameData.actualWord = getRandWord(getUniqueGameNumber(new Date(localGameData.date)) + localGameData.winCount);
      localGameData.currRow = 0;
      localGameData.currCol = 0;
      localGameData.guessMatrix = [[{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }],
      [{ letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }, { letter: '', color: '' }]];

      localStorage.setItem("gameData", JSON.stringify(localGameData));

      setgameData(JSON.parse(JSON.stringify(localGameData)));

    }


    const redundantYellowTest = (localGameData, r, c) => {
      var perfectMatches = 0;
      var perfectMatchLocations = [];
      var thisLetter = localGameData.guessMatrix[r][c].letter;

      for (let i = 0; i < WORD_LENGTH; i++) {
        //console.log(thisLetter + " === " + props.gameData.guessMatrix[props.row][i] + " === " + props.gameData.actualWord.charAt(i))
        if (thisLetter !== '' && thisLetter === localGameData.guessMatrix[r][i].letter && thisLetter === localGameData.actualWord.charAt(i)) {
          //console.log("increment perfectMatches");
          perfectMatches++;
          perfectMatchLocations.push(i);
        }

      }

      var imperfectPreceeding = 0;
      for (let i = 0; i < c; i++) {
        if (thisLetter !== '' && thisLetter === localGameData.guessMatrix[r][i].letter && thisLetter !== localGameData.actualWord.charAt(c)) {
          imperfectPreceeding++;
        }
      }

      var numOfThisLetterInWord = localGameData.actualWord.split(thisLetter).length - 1;

      //console.log("RedundantYellow row: " + props.row + " perfectMatches:"+ perfectMatches + " numThisLetter:"+ numThisLetter + " imperfectMatches:"+ imperfectMatches + " imperfectPreceeding:" + imperfectPreceeding)
      if (imperfectPreceeding + perfectMatches >= numOfThisLetterInWord) {
        // This one is redundant,
        return true;
      }
      else return false;
    }

    function assignColors(localGameData) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (localGameData.guessMatrix[localGameData.currRow][i].letter === localGameData.actualWord.charAt(i)) {
          localGameData.guessMatrix[localGameData.currRow][i].color = 'G';
        }
        else if (localGameData.actualWord.includes(localGameData.guessMatrix[localGameData.currRow][i].letter)) {
          // Special secret worlde rules... if the letter is already accounted for... 
          if (redundantYellowTest(localGameData, localGameData.currRow, i)) {
            localGameData.guessMatrix[localGameData.currRow][i].color = 'D';
          }
          else {
            localGameData.guessMatrix[localGameData.currRow][i].color = 'Y';
          }
        }
        else {
          localGameData.guessMatrix[localGameData.currRow][i].color = 'D';
        }
      }
    }

    //console.log(gameData.currRow);
    var localGameData = gameData;

    if (seconds < 1) {
      // game is over
      return;
    }

    if (input === "Enter" && isTimerRunning) {
      if (localGameData.currCol === (WORD_LENGTH)) {

        // Check win condition here (everything matches)
        var perfLetters = 0;
        var word = "";
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (localGameData.guessMatrix[localGameData.currRow][i].letter === localGameData.actualWord.charAt(i)) {
            perfLetters++;
          }
          word += localGameData.guessMatrix[localGameData.currRow][i].letter;
        }

        //console.log(word);
        if (!DEV_MODE && !isValidWord(word)) {
          setAlert({ message: "" + word + " is not in word list", type: "invalid", timestamp: seconds });
          return;
        }


        // loop through row.. assign colors.
        assignColors(localGameData);

        // Store the row in history
        localGameData.guessHistory.push(localGameData.guessMatrix[localGameData.currRow]);

        if (perfLetters === WORD_LENGTH) {
          localGameData.winCount++;

          setAlert({ message: "You got it!: " + word, type: "success", timestamp: seconds });
          //TODO: if wincount meets win condition... end game
          if (localGameData.winCount >= MAX_WINS) {
            localGameData.gameState = GAME_STATE_END;
            localGameData.winTimeRemaining = seconds;
            stopTimer();
            localStorage.setItem("gameData", JSON.stringify(localGameData));
            return;
          }
          else {
            localStorage.setItem("gameData", JSON.stringify(localGameData));
            newRound();
            return;
          }
        }
        else if (localGameData.currRow === (NUM_GUESSES - 1)) {
          setSeconds(0);
          //console.log("You Lose")
        }

        localGameData.currRow++;
        localGameData.currCol = 0;

        localStorage.setItem("gameData", JSON.stringify(localGameData));
      }
      else {
        //Handle invalid enter push.
        setAlert({ message: "Type a full word", type: "invalid", timestamp: seconds });
      }



    } else if (input === "Backspace" && localGameData.currCol > 0) {
      localGameData.currCol--;
      localGameData.guessMatrix[localGameData.currRow][localGameData.currCol].letter = '';
    }
    else if (/^[A-Z]$/i.test(input) && localGameData.currCol < WORD_LENGTH) {
      localGameData.guessMatrix[localGameData.currRow][localGameData.currCol].letter = input.toUpperCase();
      localGameData.currCol++;
      if (!isTimerRunning) {
        startTimer();
        // Timer started... save timestamp of start time.
        localGameData.gameState = GAME_STATE_ACTIVE;
        localGameData.gameStartTime = new Date();
        setAlert({ message: "", type: "success", timestamp: seconds });
      }
    }
    // We need a new reference to this object, or react wont re-render it...  Better solutions??
    setgameData(JSON.parse(JSON.stringify(localGameData)))
    //console.log(input + " being set to: " + localGameData.currRow + localGameData.currCol)

    //console.log(localGameData)

  }, [gameData, startTimer, isTimerRunning, seconds, stopTimer])

  // UseEffect calling this function (in additon to the button) caused all kinds of problems with the state, 
  // this useCallback fixed them.   this is complex, do more research on this.
  // https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook
  useEffect(() => {
    function handlekeydownEvent(event) {
      const { key } = event;
      acceptInput(key);
    }

    document.addEventListener('keydown', handlekeydownEvent)
    return () => {
      document.removeEventListener('keydown', handlekeydownEvent)
    }
  }, [acceptInput])





  return (
    <div className="App">
      <header className="App-header">

        <ScoreBoard gameData={gameData} seconds={seconds} setgameData={setgameData} setSeconds={setSeconds} />
        <Welcome gameData={gameData} seconds={seconds} />


        <Alerts alert={alert} seconds={seconds} gameData={gameData} />
        <div className="container">
          <div className='row'>
            <div className='col'>
            </div>
          </div>
        </div>

        <div className="container">
          <div className='row'>
            <div className='col'>
              <Wins gameData={gameData} />
            </div>
            <div className='col'>
              <Timer gameData={gameData} timeleft={seconds} />
            </div>
          </div>
        </div>


        <div className="container" id="letterBoxHolder">
          <GuessRow row="0" gameData={gameData} />
          <GuessRow row="1" gameData={gameData} />
          <GuessRow row="2" gameData={gameData} />
          <GuessRow row="3" gameData={gameData} />
          <GuessRow row="4" gameData={gameData} />
          <GuessRow row="5" gameData={gameData} />
        </div>

        <div className="container" id="keyboard">
          <div className="keyrow">
            <KeyButton name="Q" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="W" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="E" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="R" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="T" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="Y" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="U" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="I" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="O" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="P" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
          <div className="keyrow">
            <KeyButton name="A" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="S" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="D" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="F" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="G" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="H" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="J" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="K" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="L" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
          <div className="keyrow">
            <SpecialButton name="Enter" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="Z" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="X" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="C" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="V" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="B" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="N" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <KeyButton name="M" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
            <SpecialButton name="Backspace" gameData={gameData} setgameData={setgameData} inputHandler={acceptInput} />
          </div>
        </div>



      </header>
    </div>
  );
}

export default App;
