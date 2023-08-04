function changeTimeZone(date, timeZone) {
    if (typeof date === 'string') {
      return new Date(
        new Date(date).toLocaleString('en-US', {
          timeZone,
        }),
      )
    }
  
    return new Date(
      date.toLocaleString('en-US', {
        timeZone,
      }),
    )
}



var dates = []
var countdownDate;

var totalDuration = 1100

var startDate;

const timezone = 'Pacific/Auckland'
start()

function start() {
  fetch('./dates.json')
  .then(res => res.json())
  .then(data => {
      

      const date = new Date();
      const currentDateNZT = changeTimeZone(date, timezone)
      const timezoneOffset = date.getTime() - currentDateNZT.getTime()
      const difference = Math.round(timezoneOffset / (1000 * 60 * 60))

      const day = currentDateNZT.getDate()

      for(let i = 0; i < data.dates.length; i++) {
        let date = data.dates[i]
        if(date.day == day) {
          startDate = new Date(currentDateNZT.getFullYear(), currentDateNZT.getMonth(), date.day, date.hour, date.minutes)
          startDate.setHours(startDate.getHours() + difference)
          var elapsedTime = (new Date().getTime() - startDate.getTime())/1000
          console.log(startDate)
          console.log(new Date())
          if(elapsedTime < totalDuration && elapsedTime >= 0) {
            joinMusic()
            return
          }

          if(elapsedTime < 0) {
            dates[i] = new Date(currentDateNZT.getFullYear(), currentDateNZT.getMonth(), date.day, date.hour, date.minutes)
          } else if (elapsedTime >= totalDuration) {
            dates[i] = new Date(currentDateNZT.getFullYear(), currentDateNZT.getMonth() + 1, date.day, date.hour, date.minutes)
          }
          
        }
        
        else if(date.day > day) {
          dates[i] = new Date(currentDateNZT.getFullYear(), currentDateNZT.getMonth(), date.day, date.hour, date.minutes)
        } else {
          dates[i] = new Date(currentDateNZT.getFullYear(), currentDateNZT.getMonth() + 1, date.day, date.hour, date.minutes)
        }
        dates[i].setHours(dates[i].getHours() + difference)
        
      }

      var distances = []
      for(let i = 0;i < dates.length; i++) {
        distances[i] = dates[i] - currentDateNZT
      }

      let minimum = Math.min(...distances)
      let minIndex = distances.indexOf(minimum)



      // format time
      const options = { 
        minute: 'numeric',
        hour: 'numeric', 
        hour12: true, 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
    
      const formattedDate = dates[minIndex].toLocaleString('en-US', options);
      

      document.getElementById('nextSingDate').innerHTML = 
        `<b>NEXT SING : </b> 
          ${formattedDate}
        `
      setDate(dates[minIndex])
      
  })
  .catch(error => {
      console.error('Error:', error)
  })

}






function setDate(date) {
    // Set the countdown date
    var countDownDate = date.getTime()

    // Update the countdown every 1 second
    var countdown = setInterval(function() {

      // Get today's date and time
      var now = new Date().getTime()

      // Find the distance between now and the countdown date
      var distance = countDownDate - now

      // Calculate days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24))
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      var seconds = Math.floor((distance % (1000 * 60)) / 1000)

      // Display the countdown
      document.getElementById("days").innerHTML = days
      document.getElementById("hours").innerHTML = hours
      document.getElementById("minutes").innerHTML = minutes
      document.getElementById("seconds").innerHTML = seconds

      // If the countdown is finished, display a message
      if (distance < 0) {
        clearInterval(countdown)
        joinMusic()
      }
    }, 1000)
}


function joinMusic() {

  document.querySelector('.backgroundGradient').style.background = "linear-gradient(0deg, #511360 0%, #7d2d91 100%)"
  document.body.style.background = "#511360"
  document.querySelector('.countdownContent').style.opacity = "0"
  document.querySelector('.musicContent').style.opacity = "1"
  document.querySelector('.songInfo').style.opacity = "0.8"


}

function playAudio() {
  document.getElementById('startSingingButton').style.display = 'none'
  fetch('./songList.json')
    .then(res => res.json())
    .then(data => {
      var durationChanges = []
      var runningTotal = 0
      for(let i = 0; i < data.songList.length; i++) {
        const currSong = data.songList[i]
        durationChanges[i] = currSong.duration + runningTotal
        runningTotal += currSong.duration
        
      }


      var elapsedTime = (new Date().getTime() - startDate.getTime())/1000

      for(let i = 0; i < durationChanges.length; i++) {
          if(i == durationChanges.length-1) {
            if(elapsedTime > (durationChanges[i] + data.songList[i].duration)) {
              console.log('over')
              return
            } else {
              startSong(data.songList, i, durationChanges[i], durationChanges)
              return
            }
          }
          else if(elapsedTime < durationChanges[i]) {
            startSong(data.songList, i, durationChanges[i], durationChanges)
            return
          }
      }

    })
    .catch(error => {
      console.error('Error:', error)
    })
}

function startSong(songs, songIndex, endTime, durationChanges) {
  document.getElementById('songNameAndArtist').innerHTML = `<b>${songs[songIndex].title}</b> - <em>${songs[songIndex].artist}</em>`

        fetch(`./lyrics/${songs[songIndex].lyricsFile}`)
          .then(res => res.json())
          .then(data => {
            const audio = document.getElementById('music')
              audio.src = `./music/${songs[songIndex].songFile}`
              const isIos = navigator.maxTouchPoints > 0 && AudioContext != null
              if(isIos) {
                  ios()
              }
              audio.play()
              
              audio.currentTime = songs[songIndex].duration - (endTime - (new Date().getTime() - startDate.getTime())/1000)
              
  
              var activeLyric = 0
  
              for(let i = 0; i < data.lyrics.length; i++) {
                difference = audio.currentTime - data.lyrics[i].time
                if (difference < 0) {
                  activeLyric = i - 1
                  break
                }
              }

              if(activeLyric == -1) {
                activeLyric = 0
              }
  
  
              const progressBar = document.querySelector('.songProgress')
  
              if(activeLyric == 0) {
                document.getElementById("lyric2").innerHTML = data.lyrics[activeLyric].lyric
                document.getElementById("lyric3").innerHTML = data.lyrics[activeLyric+1].lyric
              } else {
                if(data.lyrics[activeLyric-1] != undefined) {
                  document.getElementById("lyric1").innerHTML = data.lyrics[activeLyric-1].lyric
                }else {
                  document.getElementById("lyric1").innerHTML = ""
                }
  
                document.getElementById("lyric2").innerHTML = data.lyrics[activeLyric].lyric
  
                if(data.lyrics[activeLyric+1]  != undefined) {
                  document.getElementById("lyric3").innerHTML = data.lyrics[activeLyric+1].lyric
                }else {
                  document.getElementById("lyric3").innerHTML = ""
                }
              }
              
  
              var songCount = setInterval(function() {
  
                progressBar.style.width = (audio.currentTime/audio.duration)*100 + "%"
                
  
                // on last lyric line
                if(data.lyrics[activeLyric+1] == undefined) {
                  if(audio.currentTime/audio.duration == 1) {
                    document.getElementById("lyric1").innerHTML = ""
                    document.getElementById("lyric2").innerHTML = ""
                    clearInterval(songCount)
                    progressBar.style.width = "0%"
                    if(songIndex == songs.length - 1) {
                      console.log('last song')
                      document.querySelector('.backgroundGradient').style.background = "linear-gradient(0deg, rgb(53, 92, 47) 0%, rgb(99, 172, 88) 100%)"
                      document.body.style.background = "rgb(53, 92, 47)"
                      document.querySelector('.countdownContent').style.opacity = "1"
                      document.querySelector('.musicContent').style.opacity = "0"
                      document.querySelector('.songInfo').style.opacity = "0"
                      start()
                    } else {
                      startSong(songs, songIndex + 1, durationChanges[songIndex + 1], durationChanges)
                    }
                    
                  }
                  return
                }
  
                if(audio.currentTime >= data.lyrics[activeLyric+1].time) {
                  activeLyric++

                  audio.currentTime = songs[songIndex].duration - (endTime - (new Date().getTime() - startDate.getTime())/1000)
    
    
                  if(data.lyrics[activeLyric-1] != undefined) {
                    document.getElementById("lyric1").innerHTML = data.lyrics[activeLyric-1].lyric
                  }else {
                    document.getElementById("lyric1").innerHTML = ""
                  }
    
                  document.getElementById("lyric2").innerHTML = data.lyrics[activeLyric].lyric
    
                  if(data.lyrics[activeLyric+1]  != undefined) {
                    document.getElementById("lyric3").innerHTML = data.lyrics[activeLyric+1].lyric
                  }else {
                    document.getElementById("lyric3").innerHTML = ""
                  }
                }
              }, 10)
            
            
          })
          .catch(error => {
            console.error('Error:', error)
        })
}




//////////// IOS Audio Fix


const ios = () => {
  const USER_ACTIVATION_EVENTS = [
      'auxclick',
      'click',
      'contextmenu',
      'dblclick',
      'keydown',
      'keyup',
      'mousedown',
      'mouseup',
      'touchend'
    ]

  let htmlAudioState = 'blocked'
  let webAudioState = 'blocked'

  let audio
  let context
  let source

  const sampleRate = (new AudioContext()).sampleRate
  const silentAudioFile = createSilentAudioFile(sampleRate)

  USER_ACTIVATION_EVENTS.forEach(eventName => {
  window.addEventListener(
      eventName, handleUserActivation, { capture: true, passive: true }
  )
  })

  // Return a seven samples long 8 bit mono WAVE file
  function createSilentAudioFile (sampleRate) {
      const arrayBuffer = new ArrayBuffer(10)
      const dataView = new DataView(arrayBuffer)

      dataView.setUint32(0, sampleRate, true)
      dataView.setUint32(4, sampleRate, true)
      dataView.setUint16(8, 1, true)

      const missingCharacters =
      window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          .slice(0, 13)

      return `data:audio/wav;base64,UklGRisAAABXQVZFZm10IBAAAAABAAEA${missingCharacters}AgAZGF0YQcAAACAgICAgICAAAA=`
  }

  function handleUserActivation (e) {
      if (htmlAudioState === 'blocked') {
      htmlAudioState = 'pending'
      createHtmlAudio()
      }
      if (webAudioState === 'blocked') {
      webAudioState = 'pending'
      createWebAudio()
      }
  }

  function createHtmlAudio () {
      audio = document.createElement('audio')

      audio.setAttribute('x-webkit-airplay', 'deny') // Disable the iOS control center media widget
      audio.preload = 'auto'
      audio.loop = true
      audio.src = silentAudioFile
      audio.load()

      audio.play().then(
      () => {
          htmlAudioState = 'allowed'
          maybeCleanup()
      },
      () => {
          htmlAudioState = 'blocked'

          audio.pause()
          audio.removeAttribute('src')
          audio.load()
          audio = null
      }
      )
  }

  function createWebAudio () {
      context = new AudioContext()

      source = context.createBufferSource()
      source.buffer = context.createBuffer(1, 1, 22050) // .045 msec of silence
      source.connect(context.destination)
      source.start()

      if (context.state === 'running') {
      webAudioState = 'allowed'
      maybeCleanup()
      } else {
      webAudioState = 'blocked'

      source.disconnect(context.destination)
      source = null

      context.close()
      context = null
      }
  }

  function maybeCleanup () {
      if (htmlAudioState !== 'allowed' || webAudioState !== 'allowed') return

      USER_ACTIVATION_EVENTS.forEach(eventName => {
      window.removeEventListener(
          eventName, handleUserActivation, { capture: true, passive: true }
      )
      })
  }
}


