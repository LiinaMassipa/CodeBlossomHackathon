if('serviceworker' in navigator){
    navigator.serviceworker.register('/sw.js')
    .then(()=> console.log('service worker registered'))
    .catch(() =>console.log('service worker not registered'))

}