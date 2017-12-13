
/*

public key | BDLsjYkCzbGGITXQNxyLovgX7LjZm5iPr7f7NogwiOMBog9K5K5FAr5QG75ebO3kTfqvKbjdhj41-AOalYCxwLs
private key | dDBtOaLoClUs-nKH7_i7DCyFuLG9MFv18zporzNFERo

*/
var CHANGE_VERSION = 0.1; 
var CACHE_VERSION = Date.now(); //update this post every Change
var CACHE_NAME = 'boffo-cache-v'+CACHE_VERSION;

var urlsToCache = [
    '/index.html'  ,

    /* RESOURCES */
    '/resources/Logo_48_48.png',
    '/resources/Logo_96_96.png',
    '/resources/Logo_192_192.png',

    /* SCRIPTS */
    '/scripts/angular.min.js',
    '/scripts/angular-ui-router.min.js', 
    '/scripts/boffo.js',
    '/scripts/bpwa.js',
    '/scripts/index.js',

    /* TEMPLATES */
    '/templates/accountDetail.html',
    '/templates/eventDetail.html',
    '/templates/homeDetail.html',
    '/templates/pollDetail.html',
    '/templates/proposalDetail.html',
    '/templates/queryDetail.html',

    '/templates/createEvent.html',
    '/templates/createPoll.html',
    '/templates/createProposal.html',
    '/templates/createQuery.html',

    '/templates/dirInput.html',

    /* VIEWS */
    '/views/home.html' 

    
];


self.addEventListener('install',function(event){
    console.log('*** B | SW | INSTALL | BEGIN');

    var now = Date.now();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache){
            console.log('*** B | SW | INSTALL | Opened Cache | '+CACHE_NAME);

            var cachePromise = urlsToCache.map(function(urlToCache){

                var url = new URL(urlToCache,location.href);
                url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

                var request = new Request(url, {mode: 'no-cors'});

                 fetch(request).then(function(response){
                    if(response.status>=400){
                        throw new Error(' Request for '+urlToCache+' failed with Status '+response.status);
                    }
                    console.log('*** B | SW | PRE FETCH | '+urlToCache);
                    return cache.put(urlToCache,response);
                }).catch(function(error){
                    console.error('Unable to cache '+urlToCache+' due to '+error);
                });


            });

            return Promise.all(cachePromise).then(function(){
                console.log('*** B | SW | PREFETCH | DONE');
            });

            //return cache.addAll(urlsToCache);
        })
    );


    console.log('*** B | SW | INSTALL | END');

});



self.addEventListener('activate',function(event){
    console.log('*** B | SW | ACTIVATION | ');

    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.map(function(cacheName){
                    if(cacheName!==CACHE_NAME){
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    )
});

self.addEventListener('fetch',function(event){
    console.log('*** B | SW | FETCH | BEGIN');

    event.respondWith(
        caches.match(event.request).then(function(response){
            if(response){
                return response;
            }

            var fetchRequest = event.request.clone();
            return fetch(fetchRequest).then(function(response){
                if(!response || response.status!==200 || response.type !=='basic'){
                    return response;
                }
                var responseToCache = response.clone();

                caches.open(CACHE_NAME).then(function(cache){
                    // cache.put(fetchRequest,responseToCache);
                });

                return response;
            });
        })
    );

    console.log('*** B | SW | FETCH | END');
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  console.log('*** PUSH DATA | '+(event.data.toString()));
  var msg = event.data.text();
console.log('****** '+msg);
  const title = 'Boffo';
  const options = {
    body: msg,
    icon: '/resources/Logo_96_96.png',
    badge: '/resources/Logo_96_96.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://subodhio.github.io/')
  );
});
