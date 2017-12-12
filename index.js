const applicationServerPublicKey =
  "BImq0Bc-KX_BFwduRt3krYoqzpBoq0gQQj-p8NE0nY4WP3UAXY1FjWmzd3JbT6ZhxE5WAaAIqIfhO9aqAnmCWzk";

  const privKey = "FU5fcvmakj5tbXnNj_q8HxxDiLkZ4L1llRFy3pZe76s";



var sessionId = -99;
const SERVER_URL = "http://om.cloudio.io:9180/api";

var getSession = function() {
  return new Promise(function(resolve, reject) {
    var xhttp = new XMLHttpRequest();
    var data = { username: "admin", password: "sreenivt" };
    xhttp.open("POST", "http://om.cloudio.io:9180/api/signin", false);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));

    var response = JSON.parse(xhttp.responseText);
    console.log("*** OM LOGIN | " + JSON.stringify(response));
    sessionId = response.sessionId;
    resolve(sessionId);
  });
};


var insertDS = function(dsName, insData) {
  return new Promise(function(resolve, reject) {

    console.log("### INSERT DS | " + dsName + " | Session Id | " + sessionId);
    console.log("### INSERT OBJECT | " + JSON.stringify(insData));

    if (sessionId !== -99) {

      // var payload = {
      //   sessionId: sessionId,
      //   userName: "TestUser",
      //   userEmailId: "testUser@cloudio.io",
      //   createdBy: 0,
      //   creationDate: new Date(),
      //   lastUpdatedBy: 0,
      //   lastUpdateDate: new Date()
      // };
      
      // var query_args = {
      //   data: JSON.stringify(payload),
      //   headers: { "Content-Type": "application/json" },
      //   dataType: "json"
      // };

      // URL: http://om.cloudio.io:9180/api/BFOUsers/insert

      var payload = insData;
      payload.sessionId = sessionId;

      var xhttp = new XMLHttpRequest();
      //var data = { username: "admin", password: "sreenivt" };
      xhttp.open("POST", SERVER_URL+"/"+dsName+"/insert", false);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSON.stringify(payload));

      var response = JSON.parse(xhttp.responseText);

    } else {
      getSessionId().then(
        function(response) {
          resolve(insertDS(dsName, insData));
        },
        function(err) {
          reject(err);
        }
      );
    }
  });
};


var addSubscriptionOnServer = function(data){
  return new Promise(function(resolve,reject){

      getSession().then(function(response){
        console.log('Login from Boffo Response | '+JSON.stringify(response));
        console.log('Subscription Data | '+JSON.stringify(data));
        var subscriptionObj = {createdBy : "", creationDate : new Date(), data : JSON.stringify(data), lastUpdatedBy : "", lastUpdateDate : new Date()};
        
        insertDS("BFOSubscriptions",subscriptionObj).then(function(response){
          resolve('true');  
        },function(error){
          resolve('false');
        })  
        
      },function(err){
        reject('Error');
      });

      
    }); 
}  

function waitUntilPreCache(registration) {
  return new Promise(function(resolve, reject) {
    if (registration.installing) {
      // If the current registration represents the "installing" service worker, then wait
      // until the installation step (during which the resources are pre-fetched) completes
      // to display the file list.
      registration.installing.addEventListener("statechange", function(e) {
        if (e.target.state == "installed") {
          resolve(registration);
        } else if (e.target.state == "redundant") {
          reject();
        }
      });
    } else {
      // Otherwise, if this isn't the "installing" service worker, then installation must have been
      // completed during a previous visit to this page, and the resources are already pre-fetched.
      // So we can show the list of files right away.
      resolve(registration);
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceWorker.js")
    .then(waitUntilPreCache)
    .then(function(registration) {
      
      console.log("Registration successful, scope info:", registration);

      swRegistration = registration;

      if ("PushManager" in window) {
        console.log(" Push Manager is supported ");

        const applicationServerKey = urlB64ToUint8Array(
          applicationServerPublicKey
        );
        swRegistration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          })
          .then(function(subscription) {
            console.log("User is subscribed. " + JSON.stringify(subscription));

            addSubscriptionOnServer(subscription).then(function(response){
              console.log('Subscription Added | '+response);
            });
            isSubscribed = true;
            //updateBtn();
          })
          .catch(function(err) {
            console.log("Failed to subscribe the user: ", err);
            //updateBtn();
          });
      } else {
        console.log(" Push Manager is not supported ");
      }
    })
    .catch(function(error) {
      console.log("Service worker registration failed, error:", error);
    });
} else {
  console.log("Service Worker not supported");
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



function initiaizePushManager() {}

/*
    

    
    
    */
