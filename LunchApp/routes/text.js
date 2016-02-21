

var express = require('express');
var keys = require ('../Keys');
var client = require('twilio')(keys.TWILIO_ACCOUNT_SID, keys.TWILIO_AUTH_KEY);
var router = express.Router();
var CronJob = require('cron').CronJob;
var database = require('../db');


var TwilioNumber = '+14693400518';

// for Mongo
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var assert = require('assert');
var Schema = mongoose.Schema;


var userSchema = new Schema({
    name: String,
    phone: String
});

var confirmationSchema = new Schema ({
    phone: String,
    time: String
});

var user = mongoose.model('user', userSchema ); // people collection in mongodb
var stringuser = mongoose.model('user', userSchema ); // people collection in mongodb
var confirmation = mongoose.model('confirmation', confirmationSchema );
var stringconfirmation = mongoose.model('confirmation', confirmationSchema );

var confirmedAttendees = [];

 // var confirmedAttendeesTest = [
 //     {phone: '+16026164854'},
 //     {phone: '+17174601902'},
 //     {phone: '+14802367962'},
 //     {phone: '+19723658656'}
 // ];

var d = new Date();
var testPromptTime = new Date();
var testConfirmTime = new Date();
testPromptTime.setSeconds(0);
testConfirmTime.setSeconds(0);
testPromptTime.setMinutes(d.getMinutes()+ 1);

testConfirmTime.setMinutes(d.getMinutes() + 2);

var PromptTime = ' 00 30 19 * * 0-6';
var ConfirmTime =  '00 40 00 * * 0-6';

// ------------------------- Message Strings -----------------------------
// These are the base strings for the messages

var promptMessage = 'Are you in for lunch at noon? Text \'YES\' to confirm and we\'ll let you know who else is interested!';
var immediateYesResponse = 'Good call. We\'ll text you at noon to let you know who\'s going';
var immediateNoResponse = 'Aww! We\'ll miss you!';
var cafes = ['Cafe 9',' Cafe 16','Cafe 34','Cafe 36','Cafe 31', 'Cafe 4', 'Cafe 31'];
var onlyOneAttendee = 'Looks like no one else is interested today! Better luck next time.' //Message which is sent if only one person RSVPs

//basic cron job
new CronJob({
 cronTime: PromptTime,
 onTick: function(){
   console.log('fetch users');
    // user.find( function (err, result) {
    //     console.log('Fetched users from mongo');
    //     for (var i = 0; i < result.length ; i++)
    //     { 
    //         console.log('hi');
    //         sendText(result[i].phone,'Sent from callback', true)
    //     }
    //     console.log(result);

    // });
},
start: true,
timeZone: 'America/Los_Angeles'
});

 // console.log('Fetched confirmed users from mongo');
 //                    for (var i = 0; i < result.length ; i++)
 //                    { 
 //                       var message = generateOtherAttendeesString(result[i].phone);

 //                       sendText(result[i].phone,message, true)
 //                    }
 //                    console.log(result);

new CronJob({
 cronTime: ConfirmTime, //confirmTime
 onTick: function()
 {
    console.log('fetch confirmation');
    confirmation.find
    ( function (err, result) 
        {
            user.find
            ( function (err,userresult)
                {
                    generateAllMessages(result,userresult);
                }
            );                   
        }
    );
    //sendDifferentGroupTexts(generateConfirmationMessages(confirmedAttendees))
},
start: true,
timeZone: 'America/Los_Angeles'
});


function lookUpName(phoneNumber, userList)
{
  for (counter=0;counter<userList.length;counter++)
   {
     var storedphone=userList[counter].phone;
            
     if(phoneNumber.localeCompare(storedphone)==0)
            return userList[counter].name;
   }

}

function generateAllMessages(confirmationlist,userlist)
{
    console.log('the length of confirmation is: ' + confirmationlist.length);
    console.log('the length of user is: ' + userlist.length);
}


// This function will create the confirmation message for an input phone number
function generateOtherAttendeesString(phoneNumber)
{
    // console.log('The generateOtherAttendeesString function recieved the following number: ' + phoneNumber);
    // var interestedNames=[];
    // var interestedPhones=[];

    //                 stringconfirmation.find( function (err, result) {
    //                     console.log('Fetched confirmed users from mongo - generateOtherAttendeesString');
    //                     for (var i = 0; i < result.length ; i++)
    //                     { 
    //                        if (phoneNumber.localeCompare(result[i].phone) !=0)
    //                        {
    //                         console.log('entered');

    //                             var data = {phone:result[i].phone};
    //                             interestedPhones.push(data);
    //                        }
    //                     }

    //                 });

    //                  console.log('the length is: '+ interestedPhones.length);

    //                  for (attendeeCounter=0;attendeeCounter<interestedPhones.length;attendeeCounter++)
    //                  {
    //                     var checkPhone= interestedPhones[attendeeCounter].phone;

    //                     stringuser.find( function (err, result) {
    //                     console.log('Fetched all registered users from mongo');
    //                     for (var i = 0; i < result.length ; i++)
    //                     { 
    //                          var storedname =result[i].name;

    //                        if (checkPhone.localeCompare(result[i].phone) !=0)
    //                        {
    //                             interestedNames.push(storedname);
    //                             break;
    //                        }
    //                     }
    //                 });


    

    //        console.log('generateOtherAtendeesString is returning ' + interestedNames.join(', '));
          
    //       //If there are only two people who are interested
    //       if (interestedNames.length == 1){
    //         return(interestedNames.join(', '));
    //       }
    //       else{
    //         return ([interestedNames.slice(0, -1).join(', '), 
    //             interestedNames.slice(-1)[0]].join(interestedNames.length < 2 ? '' : ' and '));
    //       }
}

// ------------------------- Receiving Texts -----------------------------
// Not sure if this is needed... Twilio doesnt use GET commands
// but probably good to have for completeness
router.get('/', function(req, res) {
  console.log('GET: message received');
});

// Post function for calls from Twilio
router.post('/', function(req, res) {
    if (req._body) 
    {
        // TODO: break to logic for each if {...} into its own function
        // to clean up the code
        // 
        // User sends any variation of yes
        if ((new RegExp("YES")).test(req.body.Body.toUpperCase()) 
          || (new RegExp("YEA")).test(req.body.Body.toUpperCase())
          || (new RegExp("YA")).test(req.body.Body.toUpperCase()))
        {
           
            // PUT SAVE FUNCTION HERE
            var testConfirmationObj = new confirmation ({
                phone: req.body.From,
                time: new Date().toISOString(),
                confirmationsent: false
            });

            testConfirmationObj.save (function (err, request) {
                if (err) return console.error(err);
                // console.dir(request);
                console.log('Yes: ' + req.body.From);
                sendText(req.body.From,immediateYesResponse, true);
            });

            // User responded yes to text message
            // TODO: Add user to lunch list
            

            // var data = {phone:req.body.From};
            // console.log('Adding ' + data.phone + ' to the confirmedAttendees list');
            // confirmedAttendees.push(data);
        }

        // User is french
        else if ((new RegExp("OUI")).test(req.body.Body.toUpperCase()))
        {
          sendText(req.body.From,'We dont like the french...', true);
        }

        // User responsed no
        else if ((new RegExp("NO")).test(req.body.Body.toUpperCase()))
        {
            // Nothing should happen here
            console.log('No');

            sendText(req.body.From,immediateNoResponse, true);
        }

        else if ((new RegExp("ADJUST FIRST TEXT TIME: ")).test(req.body.Body.toUpperCase()))
        {
            // Adjust cron job times
            // TODO add logic to break apart times

        }

        else if ((new RegExp("ADJUST SECOND TEXT TIME: ")).test(req.body.Body.toUpperCase()))
        {
            // Adjust cron job times
            // TODO add logic to break apart times
        }

        else if ((new RegExp("REGISTER")).test(req.body.Body.toUpperCase()))
        {
            // Add new user
            // TODO: break apart string and add user, no need to ask for # because it is
            // hidden is the POST request
            // 
            // TODO: How do we get their name?
        }

        // user sent some random message that didnt include the above
        // TODO - make sure user can send multiple texts to us
        else
        {
            sendText(req.body.From,'Say that again? We didn\'t catch it!', true);   
        }
    }
    console.log(confirmedAttendees[0].phone);
    // console.log('POST: message received');
    // console.log('------ REQUEST ------');
    // console.log(req);
    // console.log('------ RESPONSE ------');
    // console.log(res);
    // console.log('------ END ------');

});

// Sends the same message to a group of users 
function sendGroupTexts (groupOfUsers, message)
{
  for (counter=0;counter<groupOfUsers.length;counter++)
  {
     sendText(groupOfUsers[counter].phone,message, true)
   }
}
//Accepts an array of objects which contain a phone number and 
//the message to be sent to that number
function sendDifferentGroupTexts(responseList){
  for (counter=0;counter<responseList.length;counter++)
  {
     console.log('Sending '+ responseList[counter].phone + ' the following message: ' + 
        responseList[counter].message);
     
     sendText(responseList[counter].phone,responseList[counter].message, true)
   }
}

//Returns an array of objects with the phone number and message text 
//for that confirmed attendee
function generateConfirmationMessages(listOfAttendees){
    console.log('The number of confirmed attendees is ' + listOfAttendees.length);
    var responseList = [];
    var cafeNumber=randomCafe();
     var messageString;
    
    for(CGcounter=0; CGcounter<listOfAttendees.length;CGcounter++){
        var storedPhone=listOfAttendees[CGcounter].phone;
        

        if(generateOtherAttendeesString(storedPhone)=='')
        {
            messageString = onlyOneAttendee;
        }
        else
        {
            messageString = 'Enjoy lunch with '+ generateOtherAttendeesString(storedPhone) +'. We suggest going to '+ cafeNumber;
        }

        console.log ('messageString is: ' + messageString);

        var data = {phone: storedPhone , message: messageString};
        
        console.log ('the data object has the following message: ' + data.message);
        responseList.push(data);
        console.log ('counter is: ' + CGcounter); 
        console.log ('The messsage ' + responseList[CGcounter].message + 
            ' is queue\'d to be sent to: ' + responseList[CGcounter].phone);
    }

    return responseList;
}

// Sends a single message to a given phone number
function sendText(phoneNumber, message, retry){
    client.sendMessage( {

        to: phoneNumber, // Any number Twilio can deliver to
        from: TwilioNumber, 
        body: message // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            console.log(responseData.from + ' ' + responseData.body); // outputs "+14506667788"
            // console.log(responseData.body); // outputs "word to your mother."

        }
        else {
            console.log(err);
            // If it was the first time failed, try again
            if (retry)
            {
                sendText (phoneNumber, message, False);
            }
        }
    });
}


function randomCafe (){
    return cafes[getRandomInt(0, cafes.length-1)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
// Nick is annoying
// so is mandeep
