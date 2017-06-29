var isPushEnabled = false;
var globalSWR;


// Once the service worker is registered set the initial state  
function initialiseState() {

  // Are Notifications supported in the service worker?  
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {  
    console.warn ('Notifications aren\'t supported.');  
    return;  
  }

  // Check the current Notification permission.  
  // If its denied, it's a permanent block until the  
  // user changes the permission  
  if (Notification.permission === 'denied') {  
    console.warn('The user has blocked notifications.');  
    return;  
  }

  // Check if push messaging is supported  
  if (!('PushManager' in window)) {  
    console.warn('Push messaging isn\'t supported.');  
    return;  
  }

  // We need the service worker registration to check for a subscription  
  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 
    
    console.log('Service worker is ready');

    globalSWR = serviceWorkerRegistration;

    // Do we already have a push message subscription?  
    serviceWorkerRegistration.pushManager.getSubscription()  
      .then(function(subscription) {  
        // Enable any UI which subscribes / unsubscribes from  
        // push messages.  
        var pushButton = document.querySelector('.js-push-button');  
        pushButton.disabled = false;
       
        if (!subscription) {  
          // We aren't subscribed to push, so set UI  
          // to allow the user to enable push  
          console.warn("no subscribtion");
          return;  
        }

        console.log('subscribing to server on load')
        
        // Keep your server in sync with the latest subscriptionId
        subscribeToServer(subscription);

        // Set your UI to show they have subscribed for  
        // push messages  
        pushButton.textContent = 'Disable Push Messages';  
        isPushEnabled = true;  
      })  
      .catch(function(err) {  
        console.warn('Error during getSubscription()', err);  
      });  
  });  
}

function subscribe () {
  // Disable the button so it can't be changed while  
  // we process the permission request  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.disabled = true;

  console.log('subscribe with button event');

  if (undefined === globalSWR) {return;}

  globalSWR.pushManager.subscribe({userVisibleOnly: true})  
      .then(function(subscription) {  
        // The subscription was successful  
        isPushEnabled = true;  
        pushButton.textContent = 'Disable Push Notifications';  
        pushButton.disabled = false;      
        // TODO: Send the subscription.subscriptionId and   
        // subscription.endpoint to your server  
        // and save it to send a push message at a later date 
        console.log('subscsribe to server from subscribe func');
        console.log(subscription); 
        return subscribeToServer(subscription);
      }).catch(function(e) {  
        if (Notification.permission === 'denied') {  
          // The user denied the notification permission which  
          // means we failed to subscribe and the user will need  
          // to manually change the notification permission to  
          // subscribe to push messages  
          console.error('Permission for Notifications was denied', e);  
          pushButton.disabled = true;  
        } else {  
          // A problem occurred with the subscription; common reasons  
          // include network errors, and lacking gcm_sender_id and/or  
          // gcm_user_visible_only in the manifest.  
          console.error('Unable to subscribe to push.', e);  
          pushButton.disabled = false;  
          pushButton.textContent = 'Enable Push Notifications';  
        }  
      });  
}

function unsubscribe() {  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.disabled = true;

  // To unsubscribe from push messaging, you need get the  
  // subscription object, which you can call unsubscribe() on.  
  globalSWR.pushManager.getSubscription().then(  
    function(pushSubscription) {  
      // Check we have a subscription to unsubscribe  
      if (!pushSubscription) {
        // No subscription object, so set the state  
        // to allow the user to subscribe to push  
        isPushEnabled = false;  
        pushButton.disabled = false;  
        pushButton.textContent = 'Enable Push Notifications';  
        return;  
      }  
          
      var subscriptionId = pushSubscription.subscriptionId;  
      // Make a request to your server to remove  
      // the subscriptionId from your data store so you   
      // don't attempt to send them push messages anymore

      // We have a subscription, so call unsubscribe on it  
      pushSubscription.unsubscribe().then(function(successful) {  
          pushButton.disabled = false;
          pushButton.textContent = 'Enable Push Notifications';
          isPushEnabled = false;

          unsubscribeToServer(subscriptionId);
      }).catch(function(e) {  
        // We failed to unsubscribe, this can lead to  
        // an unusual state, so may be best to remove   
        // the users data from your data store and   
        // inform the user that you have done so

        console.log('Unsubscription error: ', e);  
        pushButton.disabled = false;
        pushButton.textContent = 'Enable Push Notifications'; 

        unsubscribeToServer(subscriptionId);
      });  
    }).catch(function(e) {  
     console.error('Error thrown while unsubscribing from push messaging.', e);  
    });  
}

function subscribeToServer (subscription) {
    console.log('calling an ajax with subscription ' + subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', ''));
    var request = $.ajax({
      url: '/subscription',
      method: 'POST',
      data: {
        subscriptionId: subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', '')
      },
      success: function (data) {
        console.log(data);
      }
    });
}

function unsubscribeToServer (subscriptionId) {
    console.log('calling an ajax to unsubscribe');
    var request =  $.ajax({
      url: '/subscription',
      method: 'DELETE',
      data: {
        subscriptionId: subscriptionId
      },
      success: function (data) {
        console.log(data);
      }
    });
}

window.addEventListener('load', function() {  
  var pushButton = document.querySelector('.js-push-button');  
  pushButton.addEventListener('click', function() {  

    if (isPushEnabled) {  
      unsubscribe();  
    } else {  
      subscribe();  
    }  
  });

  

  // Check that service workers are supported, if so, progressively  
  // enhance and add push messaging support, otherwise continue without it.  
  if ('serviceWorker' in navigator) {  
    navigator.serviceWorker.register('/serviceWorker.js').then(initialiseState)  
  } else {
    console.warn('Service workers aren\'t supported in this browser.');  
  }  
});
