const box = document.getElementById("urlList")
const copyBtn = document.getElementById("copyBtn")
const jsonBtn = document.getElementById("jsonBtn")

let info = {}

function add(name,value){

info[name] = value

let el = document.createElement("div")
el.innerHTML = "<b>"+name+":</b> "+value
box.appendChild(el)

}

async function loadInfo(){

// Device info
add("User Agent", navigator.userAgent)

let device = "Desktop"
if(/Mobi|Android/i.test(navigator.userAgent)) device="Mobile"

add("Device Type", device)

add("OS", navigator.platform)

let chromeVersion = navigator.userAgent.match(/Chrome\/([0-9.]+)/)
add("Chrome Version", chromeVersion ? chromeVersion[1] : "Unknown")

add("Language", navigator.language)

add("Resolution", screen.width + " x " + screen.height)

add("Online Status", navigator.onLine ? "Online" : "Offline")

add("CPU Cores", navigator.hardwareConcurrency)

add("RAM", navigator.deviceMemory ? navigator.deviceMemory + " GB" : "Unknown")

add("Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)


// GPU INFO
let canvas = document.createElement("canvas")
let gl = canvas.getContext("webgl")

if(gl){

let debugInfo = gl.getExtension("WEBGL_debug_renderer_info")

if(debugInfo){

let gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

add("GPU", gpu)

}

}


// Battery
if(navigator.getBattery){

let battery = await navigator.getBattery()

add("Battery Level", Math.round(battery.level*100) + "%")

add("Charging", battery.charging ? "Yes" : "No")

}


// PUBLIC IP + GEO
try {

let res = await fetch("https://ipinfo.io/json")
let data = await res.json()

add("Public IP", data.ip)
add("City", data.city)
add("Region", data.region)
add("Country", data.country)
add("Location", data.loc)
add("ISP", data.org)

// VPN detection
detectVPN(data)

} catch (e) {

add("IP Info", "Failed to load")

}


// WebRTC Local IP
getLocalIP()

}


// WEBRTC LOCAL IP
function getLocalIP(){

let pc = new RTCPeerConnection({iceServers:[]})

pc.createDataChannel("")

pc.createOffer().then(offer => pc.setLocalDescription(offer))

pc.onicecandidate = e => {

if(!e || !e.candidate) return

let ip = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate)

if(ip){

add("WebRTC Local IP", ip[1])

pc.onicecandidate = null

}

}

}


// VPN DETECTION
function detectVPN(data){

let vpn = "No"
let reason = "Residential network"

if(!data.org){
add("VPN / Proxy","Unknown")
return
}

let org = data.org.toLowerCase()

let vpnKeywords = [
"vpn",
"proxy",
"digitalocean",
"linode",
"amazon",
"aws",
"google cloud",
"microsoft",
"azure",
"ovh",
"vultr",
"datacenter",
"hosting",
"server"
]

for(let word of vpnKeywords){

if(org.includes(word)){

vpn = "Possible VPN / Proxy"
reason = "Hosting provider detected"

}

}

add("VPN / Proxy", vpn)
add("Network Type", reason)

}


// COPY BUTTON
copyBtn.onclick = function(){

let text = ""

for(let k in info){

text += k + ": " + info[k] + "\n"

}

navigator.clipboard.writeText(text)

}


// EXPORT JSON
jsonBtn.onclick = function(){

let blob = new Blob([JSON.stringify(info,null,2)], {type:"application/json"})

let url = URL.createObjectURL(blob)

let a = document.createElement("a")

a.href = url
a.download = "device-info.json"
a.click()

}


// START
loadInfo()
