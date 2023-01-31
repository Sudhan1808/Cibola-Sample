var firebaseConfig = {
  apiKey: "AIzaSyD1OD96RZW9tkL5112KQV5ooe_7PyiSwlM",
  authDomain: "cibola-demo.firebaseapp.com",
  databaseURL: "https://cibola-demo-requz.firebaseio.com",
  projectId: "cibola-demo",
  storageBucket: "cibola-demo.appspot.com",
  messagingSenderId: "145114065543",
  appId: "1:145114065543:web:10a0d8e031160d0de62622",
};

   firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
   // Global variables
    let userId;
    let userEmail;
    let userName;
    let topics = ["Art & Culture", "Automobile", "Geography", "History", "Movies", "Music","Religion","Science", "Sports", "Technology"];
    var currentTopic = "";
    var currentQuestion = "";
    var currentAnswers = {};
    var currentScore = {};
    let totalScore = 0;
    let subCounter = 0;
    let roundCounter = 1;
    let uniqueNumbers = " ";
    let subId;
    let scoreDiv = document.getElementById("score-container");    
    let duration = .5 * 60 * 1000;
    let countDownDate;
    let x;

    document.getElementById("google-signin-button").style.display = "none";
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         userId = user.uid;
         userEmail = user.email;
         userName = user.displayName;
        // Fetch Current URL
        // Example for current URL 
        // (http://localhost:8000/landing.html?fragment=http://localhost:8000/index.html?fragment=def1e5c7-c6af-4de0-a451-10b12148edf4)
        var currentUrl = window.location.href;
        console.log(currentUrl);
        // Split the current URL 
        var parts = currentUrl.split("=");
        // Splitted URL(http://localhost:8000/index.html?fragment=def1e5c7-c6af-4de0-a451-10b12148edf4)
        // Above URL is assigned to secPart 
        var secPart = parts[1];
        console.log(secPart);
        // Remove unique ID from secPart (http://localhost:8000/index.html?fragment=def1e5c7-c6af-4de0-a451-10b12148edf4)
        // To generate the actual sign-in page URL 
        var uniqueparts = secPart.split("=")
        var usecPart = uniqueparts[0];
        console.log(usecPart)
        // After split (http://localhost:8000/index.html?fragment)
        // Assigned to usecPart
        // Unique number generation 
        var uniqueNumber = uuidv4();
        console.log(uniqueNumber);
        // Assign Unique number genrated to usecPart (http://localhost:8000/index.html?fragment) 
        var uniqueUrl = usecPart + "=" + uniqueNumber;
        sessionStorage.setItem("ShareURL",(uniqueUrl));
        console.log(uniqueUrl);
        console.log(sessionStorage);
        // Assigned sample uniqueUrl (http://localhost:8000/index.html?fragment=9f842914-c51e-49c5-a885-475ae4e356fe)

        // Add user information to the Firebase Realtime Database
        firebase.database().ref('users/' + userId).once('value', function(snapshot) {
          if (!snapshot.exists()) {
            firebase.database().ref('users/' + userId).set({
              clickedURL: secPart,
              email: userEmail,
              name: userName,
              shareURL: uniqueUrl, 
           });
          }
        });
        // Display user information
        var username = user.displayName.split(" ");
        var firstName = username[0];
        var lastName = username[1];
        var profilePicture = user.photoURL;
        var userInfo = document.getElementById("user-info");
        userInfo.innerHTML = "Welcome," + firstName + " " + lastName + "<img src='" + profilePicture + "'>";
      }
    });  
    //Create share on Whatsapp button - link to be fetched from FB_DB  
    function sharetoLink(){
      let shareURL = (sessionStorage.getItem("ShareURL"));
      console.log(shareURL);
      var shareButton = document.createElement("button");
      shareButton.innerHTML = "Share Now";
      shareButton.addEventListener("click", function(){
      window.location.href = "whatsapp://send?text=Checkout CIBOLA, the ultimate play to earn game           " + shareURL;
    });
      document.getElementById('shareButton').appendChild(shareButton);
    } 
   
    // Save Payment.ID to FB_DB  
    function savetofbDB(response) {
    console.log(response)
    firebase.database().ref('users/' + userId).child('payment_id').
    set(response.razorpay_payment_id);
  } 
   // Payment POPup and entire payment gateway integration
  function paymentProcess() {
  var options = {
      "key": "rzp_test_1J3b4uKCTWTNr6", // Enter the Key ID generated from the Dashboard
      "amount": 20*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 means 50000 paise or ₹500.
      "currency": "INR",
      "name": "Cibola Entry Fee",
      "description": "Pay to continue your Quest",
      "image": "Polygon 1.png",
      "handler": function (response){
          savetofbDB(response);
          resumeTimer();
          sharetoLink();            
      },
      "prefill": {
          "name": userName,
          "email": userEmail,
      },
      "notes": {
          "address": "note value"
      },
      "theme": {
          "color": "#9932CC"
      },
      "modal" :{
        "backdropclose" : "false",
        "escape" : "false",
        "handleback" : "false",
        "confirm_close" : "true",
        "ondismiss" : function retryPayment() {//Creates Retry Payment button upon failure or Closing of Pyament windoe
          var button = document.createElement("button");
              button.innerHTML = "RetryPayment"
              button.setAttribute("onclick", "paymentProcess()");
              button.addEventListener("click", function() {
              this.remove();
              });
              document.getElementById('retryPayment').appendChild(button);
          }
      }
  }
  var razorpay = new Razorpay(options);
  razorpay.open();
}

      let progresstimer = document.getElementById('timerbar');
      let score = 0;
      function countdownBar(remainingTime){
      score= (remainingTime/duration)* 100;
      progresstimer.style.width = score + "%"; }
// Count down timer start on Question display and ends at 0 to close everything 
    function startTimer(duration) 
    {
      countDownDate = Date.now() + duration;
      let remainingTime = countDownDate - Date.now();
       x = setInterval(function() {
      let now = Date.now();
      let distance = countDownDate - now;
      let minutes = Math.floor(distance / (60 * 1000));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      let timerDisplay = document.getElementById("countdown");
      timerDisplay.innerHTML = minutes + "m " + seconds + "s ";
      countdownBar(remainingTime);
      if (distance < 1000) {
            clearInterval(x);
            sessionStorage.setItem("remainingTime",JSON.stringify(remainingTime));
            let storedTime = sessionStorage.getItem("remainingTime");
            timerstop();
            return;
        }
      }, 1000);
    }
 // Pause countdown timer on Payment PopUp
    function pauseTimer() {
        clearInterval(x);
        let remainingTime = countDownDate - Date.now();
        sessionStorage.setItem("remainingTime", JSON.stringify(remainingTime));
      }
// Function for shuffle of SubID
      function fisherYatesShuffle(arr) {
        let m = arr.length;
        while (m) {
          let i = Math.floor(Math.random() * m--);
          [arr[m], arr[i]] = [arr[i], arr[m]];
        }
        return arr;
      }
       
  
      document.getElementById("progress-bar").style.display = "none";
      // Function to display the topic buttons
      function displayTopicButtons() 
      {
        

        var buttonDiv = document.getElementById("topic-buttons");
            buttonDiv.innerHTML = "";
            console.log(subCounter);
            for (var i = 0; i < topics.length; i++) 
            {
              var button = document.createElement("button");
                  button.innerHTML = topics[i];
                  document.getElementById("startQuiz").style.display = "none";
                  document.getElementById("backtoTopics").style.display = "none";
                  button.setAttribute("onclick", "displayQuestions('" + topics[i] + "'); startTimer(duration);");
                  button.classList.add("topic-button");
                  buttonDiv.appendChild(button);
                  buttonDiv.style.display = "block";
                  buttonDiv.appendChild(document.createElement("br"));
            }
            subCounter = 0;    
       } 
      // Function to display the questions and Answers
      function displayQuestions(topic) 
      { 
        document.getElementById("startQuiz").style.display = "none";
        document.getElementById("progress-bar").style.display = "block";
        document.getElementById("round-number").innerHTML = "Round 0"+ roundCounter;

        if (subCounter >= 10) 
        {
          scoreDiv = document.getElementById("score-container").style.display = "block";
          roundContinuer();
        } 
          if (subCounter == 0) 
          {
            document.getElementById("backtoTopics").style.display = "block";
            var buttonDiv = document.getElementById("topic-buttons");
                buttonDiv.style.display = "none";
            var messageDiv = document.getElementById("message");
                messageDiv.innerHTML = "Time remaining: "; 
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Numbers to be shuffled using FisherYates
                fisherYatesShuffle(numbers);
                uniqueNumbers = numbers.slice(0, 11);
                console.log(uniqueNumbers);                    
           }
            currentTopic = topic; // To list questions from the current topic alone
            var questionDiv = document.getElementById("questions");
                questionDiv.innerHTML = "";                
                console.log(subCounter);       
                  let countId = uniqueNumbers[subCounter]; // Assign shuffled SubId between 1 to 10
                  subId = countId;
                  if(countId == 10)
                  {subId = countId}else{subId = "0" + countId} // To make the SubId as per the DB
                  console.log(subId);
                  if(subId <= 10)
                  {
                    console.log(roundCounter);
                   var questions = database.ref("Topics/" + currentTopic +"/Round0" + roundCounter + "/Sub" + subId); //SubId picked
                       questions.once("value").then(function(snapshot) 
                    {
                       if(snapshot.val() !== null) //Returns true is snapshot.val() has child and false if snapshot.val () doesnt have child
                        {
                          var questions = snapshot.val();
                          var questionKeys = Object.keys(questions);
                          var randomQuestion = questionKeys[Math.floor(Math.random() * questionKeys.length)]; //Picks random child with key from i to iv inside the selected SubId
                              currentQuestion = randomQuestion;
                          var question = questions[randomQuestion].Question;
                              questionDiv.innerHTML = question;
                          var answerDiv = document.getElementById("answers");
                              answerDiv.innerHTML = "";
                              currentAnswers = questions[randomQuestion].Answers; //Refers to the Answers section with the Key selected above
                              currentScore = questions[randomQuestion].ScoreCard; //Refers to the Scorecard section with the Key selected above
                          var answerKeys = Object.keys(currentAnswers);
                              for (var i = 0; i < answerKeys.length; i++) 
                              {
                               var button = document.createElement("button");
                                   button.innerHTML = currentAnswers[answerKeys[i]];
                                   button.setAttribute("onclick", "checkAnswer('" + answerKeys[i] + "')");
                                   answerDiv.appendChild(button);
                                   answerDiv.appendChild(document.createElement("br"));
                               }                          
                                scoreDiv = document.getElementById("score-container");
                                scoreDiv.innerHTML = "Your Score: " + totalScore + "/" + ((subCounter+1) * 10);
                                subCounter++;
                                if(subCounter == 5) {
                                  popup();
                                  pauseTimer();
                                 }                                    
                         }
                          else 
                          {
                            console.log("No questions found in this sub-topic!");
                          }
                      });
                   }
               }    
           
           
       // Function to check the answer and update the score
       function checkAnswer(answer) {
       if (currentAnswers[answer] !== undefined && currentScore[answer] !== undefined) 
       {totalScore = Number(totalScore) + Number(currentScore[answer]); //totalScore being the accumulative score and currentScore being the current answer's score
        sessionStorage.setItem("roundScore",totalScore);
        let progressBar = document.getElementById("progress");
        let score = 0;
        function updateScore(totalScore) {
        score = totalScore;
        progressBar.style.width = score + "%";
       }
        console.log(totalScore);
        updateScore(totalScore);
        displayQuestions(currentTopic);}
       else{console.log("Invalid answer or score!");} }

    // POPup for Main Menu button click
    function backtoTopics()
    {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, go Back!'
      }).then((result) => {
        if (result.isConfirmed){
          location.reload(); 
        }
        });
    }

    // Hides all question answers default call at coundown=0, create a tryagain button on click page reload
    function timerstop()
    {
      questionDiv = document.getElementById("questions");
      questionDiv.style.display = "none";
      answerDiv = document.getElementById("answers");
      answerDiv.style.display = "none";
      var restartDiv = document.getElementById("restart");     
      restartDiv.innerHTML = "Oops!!, Don't Give up you came far";
      subCounter = 0;
      var restartButton = document.createElement("button");
      restartButton.innerHTML = "Try Again";
      document.body.appendChild(restartButton);
      restartButton.style.display = "block";
      restartButton.addEventListener("click", function()
      {
        location.reload(); 
      });  
    }    

    //Payment lead POPup
    function popup() 
    {
      questionDiv = document.getElementById("questions");
      questionDiv.style.display = "none";
      answerDiv = document.getElementById("answers");
      answerDiv.style.display = "none";
      Swal.fire({
        title: 'You performed better than 80% of our users please proceed to pay and continue your Quest',
        icon: 'success',
        scrollbarPadding : false,
        showCancelButton: false,
        showCloseButton : false,
        allowEscapeKey : false,
        width : '52em',
        background : '#9932CC',
        confirmButtonText: 'Paynow',
        confirmButtonColor: '#3085d6', 
        allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            paymentProcess();
          } else if (result.dismiss === Swal.DismissReason.cancel){}});
    }
     
    //Resume countdown timer on successful payment
    function resumeTimer() {
    let storedTime = JSON.parse(sessionStorage.getItem("remainingTime"));
        startTimer(storedTime);
        questionDiv = document.getElementById("questions");
        questionDiv.style.display = "block";
        answerDiv = document.getElementById("answers");
        answerDiv.style.display = "block";
    }

    //Called at the end of a Round to reset timer and fetch questions from the next round
function roundContinuer() {
  clearInterval(x);
  roundCounter ++ ;
  subCounter = 0;
  totalScore = 0;
  document.getElementById("score-container").style.display = "none";
  let storedScore = sessionStorage.getItem("roundScore");
      fullScore = document.getElementById("fullScore");
  fullScore.innerHTML = "You have Scored a total of " + storedScore + "/100 in Round 01";
  document.getElementById("backtoTopics").style.display = "block";
          questionDiv = document.getElementById("questions");
          questionDiv.style.display = "none";
          answerDiv = document.getElementById("answers");
          answerDiv.style.display = "none";
      var messageDiv = document.getElementById("message");
          messageDiv.style.display = "none";
          timerDiv = document.getElementById("countdown");
          timerDiv.style.display = "none";
          if(storedScore >= 92)
          {
   document.getElementById("congratulations").innerHTML = "Congratulations you have won Rs.100 your reward will be credited to you within 48 to 72 hours"; 
   document.getElementById("round-continue").innerHTML = "Proceed to the Next round by clicking the continue to Round 02 button and get closer to the ultimate treasure of Rs.1,00,000"; 
      var button = document.createElement("button");
          button.innerHTML = "Countine to Round0"+roundCounter;
          button.addEventListener("click", function() {
            startTimer(duration);
            this.remove();
            fullScore.style.display = "none";
            questionDiv.style.display = "block";
            answerDiv.style.display = "block";
            messageDiv.style.display = "block";
            timerDiv.style.display = "block";
            document.getElementById("score-container").style.display = "block";
         });
          document.getElementById('continue').appendChild(button);
         }
         else{
          document.getElementById("failMessage").innerHTML = "You came close to the treasure of CIBOLA please try again";
         }
}
  
  


