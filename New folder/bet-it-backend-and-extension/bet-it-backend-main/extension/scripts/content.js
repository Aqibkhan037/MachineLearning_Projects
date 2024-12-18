const API_ENDPOINT = "https://over4fun.com/api/v2/stats"
// const API_ENDPOINT = "http://127.0.0.1:5052/api/v2/stats"
const API_AUTH = "ZXh0ZW5zaW9uOkQ5QXdzdjRoVnpIdTZwWTU="

setTimeout(async () => {
    if (document.location.href === "https://www.bet365.it/#/IP/B1") {
        try {
            await scan()
        } catch (e) {
            console.log(`"FAILED TO SCAN: ${e}`)
            setTimeout(() => {
                document.location = document.location.href
            }, 5000)
        }

        while (1)
            try {
                await update()
                await delay(3000)
            } catch (e) {
                console.log(`ERROR: ${e}`)
                await delay(2e3)
            }
    } else if (document.location.href.startsWith("https://www.bet365.it")) {
        setTimeout(() => {
            document.location = "https://www.bet365.it/#/IP/B1"
        }, 3e5)
    }
}, 7e3)

setTimeout(() => {
    document.location = "https://www.bet365.it/#/IP/B1"
}, 10 * 60e3)

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function switchTab(index) {
    return new Promise(async resolve => {
        let elm = document.getElementsByClassName("ovm-ClassificationMarketSwitcherMenu_Item")[index]
        elm.dispatchEvent(new MouseEvent("mousedown"))
        elm.dispatchEvent(new MouseEvent("mouseup"))
        await delay(10)
        resolve()
    })
}

let match_info = {}

async function scan() {
    console.log("Scan started")
    let groups = document.getElementsByClassName("ovm-CompetitionList")
    if (!groups) return console.log("No tournaments found");
    groups = groups[0].getElementsByClassName("ovm-Competition ovm-Competition-open")
    if (!groups) return console.log("No active matches found");
    console.log(`${groups.length} tournaments found`)
    for (let group of groups) {
        try {
            let title = group.getElementsByClassName("ovm-CompetitionHeader_NameText")[0].innerText.trim()
            try {
                let matches = group.getElementsByClassName("ovm-Fixture_Container")
                console.log(`${matches.length} matches in '${title}'`)
                for (let match of matches) {
                    let match_data = {
                        title: title,
                        teams: [0, 1].map(i => match.getElementsByClassName("ovm-FixtureDetailsTwoWay_TeamName")[i].innerText.trim()),
                        scores: [0, 0],
                        events: []
                    }
                    match_data["id"] = (await get_id(title, match_data.teams[0], match_data.teams[1])).toString()
                    // console.log(`${match_data.id}: ${match_data.teams[0]} VS ${match_data.teams[1]}`)
                    let elm = match.getElementsByClassName("ovm-FixtureDetailsTwoWay_Timer ovm-InPlayTimer")[0]
                    elm.classList.add("ext-match-timer")
                    elm.setAttribute("ext-game-id", match_data.id);
                    [0, 1].forEach(i => {
                        elm = match.getElementsByClassName(`ovm-StandardScoresSoccer_Team${(i === 0) ? "One" : "Two"}`)[0]
                        elm.setAttribute("ext-game-id", match_data.id)
                        elm.classList.add(`ext-match-score-${i}`)

                    })
                    elm = match.parentElement.getElementsByClassName("ovm-MediaIconContainer")[0]
                    elm.classList.add(`ext-match-events`)
                    elm.setAttribute("ext-game-id", match_data.id)
                    match_info[match_data.id] = match_data
                }
            } catch (match_error) {
                console.log(`MATCH ERROR: ${match_error}`)
                await delay(1e3)
            }
        } catch (group_error) {
            console.log(`GROUP ERROR: ${group_error}`)
            await delay(1e3)
        }
    }
    console.log("Done Scanning")
}

async function update() {
    for (let elm of document.getElementsByClassName("ext-match-timer")) {
        elm.scrollIntoView()
        await delay(100)
        let t = elm.innerText.trim().split(":")
        match_info[elm.attributes["ext-game-id"].value]["time"] = parseInt(t[0]) * 60 + parseInt(t[1])
    }
    [0, 1].forEach(i => {
        for (let elm of document.getElementsByClassName(`ext-match-score-${i}`))
            match_info[elm.attributes["ext-game-id"].value]["scores"][i] = parseInt(elm.innerText.trim())
    })
    for (let elm of document.getElementsByClassName("ext-match-events")) {
        let match = match_info[elm.attributes["ext-game-id"].value]
        if (match.events.filter(u => u.type === "GOAL").length !== match.scores[0] + match.scores[1]) {
            if (!elm.children[0].children[0])
                continue
            elm.children[0].children[0].click()
            await delay(500)
            for (let e of document.getElementsByClassName("ml1-LocationEventsMenu_Text"))
                if (e.innerText.toLowerCase().trim() === "cronologia") {
                    e.click()
                    break
                }
            await delay(500)
            let events = document.getElementsByClassName("ml1-SoccerSummary")
            if (events) {
                events = events[0].getElementsByClassName("ml1-SoccerSummaryRow ml1-SoccerSummaryRow-eventrow") || []
                console.log(`${events.length} events found`)
                let new_events = []
                for (let event of events) {
                    let event_data = {
                        time: parseInt(event.children[1].innerText.trim().replace("'", "")),
                        team: event.children[0].innerHTML.trim() ? 0 : 1,
                        type: "UNKNOWN"
                    }
                    let event_type = event.children[event_data.team * 2].innerHTML
                    for (let i of [
                        ["1", "CORNER_KICK"],
                        ["2", "GOAL"],
                        ["4", "YELLOW_CARD"],
                        ["5", "RED_CARD"],
                        ["7", "CORNER_KICK"],
                    ])
                        if (event_type.indexOf(`ml1-SoccerSummaryRow_Icon-${i[0]}`) > 0) {
                            event_data["type"] = i[1]
                            break
                        }
                    new_events.push(event_data)
                }
                if (new_events.filter(u => u.type === "GOAL").length === match.scores[0] + match.scores[1])
                    match.events = new_events
            }
        }
    }

    Object.values(match_info).forEach(match => {
        let hash = [match.scores[0].toString(), match.scores[1].toString(), match.time.toString()].join(",,,")
        if (match.hash !== hash) {
            match.hash = undefined
            fetch(`${API_ENDPOINT}/update-single-game/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${API_AUTH}`
                },
                body: JSON.stringify(match)
            }).then()
            match.hash = hash
        }
    })

}

function get_id(title, team1, team2) {
    return new Promise(resolve => {
        let encoder = new TextEncoder()
        crypto.subtle.digest("sha-1", encoder.encode([title, team1, team2].join(",,,"))).then(result => {
            resolve(Array.from(new Uint8Array(result)).map(u => u.toString(16).padStart(2, '0')).join(''))
        })
    })
}

