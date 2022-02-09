import {api_key} from "./secret.js";
const monthNames = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
                    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];
const weekdays = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];

const updateEvents = new Event('updateEvents');

let state = {
    _data: {},
    set data(val) {
        let valueChanged = JSON.stringify(this._data) !== JSON.stringify(val)
        this._data = val
        if (valueChanged) {window.dispatchEvent(updateEvents)}
    },
    get data() {
        return this._data
    },
}

let start_date = Date.now()

async function loadEvents() {
    let calendar_url = new URL("https://www.googleapis.com/calendar/v3/calendars/p4r635n487mr7u9cje9n6985e0@group.calendar.google.com/events")
    let minDate = new Date(start_date);
    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    let params = {
        key: api_key,
        timeMin: minDate.toISOString(),
        maxResults: 6,
        orderBy: "startTime",
        singleEvents: true,
    }
    calendar_url.search = new URLSearchParams(params).toString()
    let new_data = await fetch(calendar_url)
        .then(response => response.json())
        .then(data => data["items"])

    state.data = new_data
}
function updateCalendar() {
    if ('content' in document.createElement('template')) {
        let calendar_items = state.data;

        console.log(calendar_items)
        let events = ["#event1", "#event2", "#event3", "#event4", "#event5", "#event6"];
        events.forEach((e, i) => {
            let event = document.querySelector(e);
            let template = document.querySelector("#event");

            let clone = template.content.cloneNode(true);

            let month = clone.querySelector(".month");
            let day = clone.querySelector(".day");
            let weekday = clone.querySelector(".weekday");

            let time = clone.querySelector(".time_field");

            let name = clone.querySelector(".name");
            let location = clone.querySelector(".location");

            let item = calendar_items[i]

            let start_date = new Date(item.start.dateTime || item.start.date)
            let end_date = new Date(item.end.dateTime || item.end.date)

            month.textContent = monthNames[start_date.getMonth()];

            day.textContent = start_date.getDate() == end_date.getDate() ? start_date.getDate()
                : start_date.getDate() + " - " + end_date.getDate()
            weekday.textContent = weekdays[start_date.getDay()]

            time.textContent = ("0" + start_date.getHours()).slice(-2) + ":"
                + ("0" + start_date.getMinutes()).slice(-2) + " - "
                + ("0" + end_date.getHours()).slice(-2) + ":"
                + ("0" + end_date.getMinutes()).slice(-2)

            name.textContent = item["summary"]
            location.textContent = item["location"]

            // Remove previous content and update with new data
            event.innerHTML = ""
            event.appendChild(clone);
        })

    } else {
        console.log("HTML Templates not supported")
    }
}

function updateClock() {
    let clock = document.querySelector("#clock")
    let date = new Date(Date.now())
    clock.textContent = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)
}

window.addEventListener('DOMContentLoaded', loadEvents)
window.addEventListener('updateEvents', updateCalendar)

setInterval(loadEvents, 1000*60*10) // Poll every 10min
setInterval(updateClock, 1000)