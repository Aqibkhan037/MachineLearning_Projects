import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {Filter} from "../filters/filters.component";
import {COLORS} from "../../colors";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  time = 0
  goal1 = 0
  goal2 = 0
  data ?: {
    games: {
      title: string
      time: number
      live: boolean
      teams: string[]
      scores: number[]
      probabilities: number[]
      odds: number[]
      handicap: number[]
      asian_odds: number[]
      asian_handicap: number[]
      events: {
        time: number
        team: boolean,
        type: string
      }[]
      reg_time: number
      mod_time: number
      predict: any
      color?: string
    }[]
    timestamp: number
  }
  filterLive = false
  filters: Filter[] = []
  isAdmin = false

  constructor(private api: ApiService) {
  }

  timeToStr(t: number) {
    return (t / 60).toFixed(0).padStart(2, "0") + ":" + (t % 60).toFixed(0).padStart(2, "0")
  }

  update() {
    this.api.get(`/stats/?t=${this.time}&g1=${this.goal1}&g2=${this.goal2}`).subscribe(httpResponse => {
      this.data = httpResponse.body
      if (this.data)
        for (let r of this.data?.games) {
          let goals = r.events.filter(u => u.type == "GOAL")
          for (let f of this.filters) {
            if (f.enabled && ((r.scores[0] == f.score[0]) && (r.scores[1] == f.score[1]) || (r.scores[0] == f.score[1]) && (r.scores[1] == f.score[0]))) {
              let match = true
              for (let g of f.goals) {
                try {
                  if (g.start_time && (g.start_time > goals[g.goal].time))
                    match = false
                  else if (g.end_time && (g.end_time < goals[g.goal].time))
                    match = false
                  else if (g.differance && (g.differance < (goals[g.goal].time - goals[g.goal - 1].time)))
                    match = false
                } catch (e) {
                }
              }
              if (match) {
                r.color = COLORS[f.color || 0]
                break;
              }
            }
          }
        }
    })
  }

  loadFilters() {
    this.api.get("/filters/").subscribe(httpResponse => {
      this.filters = httpResponse.body
    }, error => {
      alert("Failed to load filters")
    })
  }

  ngOnInit(): void {
    this.update()
    setInterval(() => {
      this.update()
    }, 2000)
    this.loadFilters()
    this.api.post("/is-admin/").subscribe(httpResponse => {
      this.isAdmin = httpResponse.body == true
    })
  }

  xls(tf?: string) {
    let s = ""
    let t = new Date()
    let daysToTuesday = (t.getDay() + 7 - 2) % 7;
    t.setHours(0, 0, 0, 0)
    let today = t.getTime() / 1000
    t.setDate(t.getDate() - 1)
    let yesterday = t.getTime() / 1000
    t.setDate(t.getDate() - daysToTuesday + 1);
    let this_week = t.getTime() / 1000
    t.setDate(t.getDate() - 7)
    let last_week = t.getTime() / 1000

    switch (tf) {
      case "today":
        s = `&start_time=${today}`
        break
      case "yesterday":
        s = `&start_time=${yesterday}&end_time=${today}`
        break
      case "this_week":
        s = `&start_time=${this_week}`
        break
      case "last_week":
        s = `&start_time=${last_week}&end_time=${this_week}`
        break
      case "all":
        s = ""
        break
    }
    document.location = `${this.api.baseUrl}/stats/?excel=true${s}`
  }

  toggleLive() {
    this.filterLive = !this.filterLive
  }
}
