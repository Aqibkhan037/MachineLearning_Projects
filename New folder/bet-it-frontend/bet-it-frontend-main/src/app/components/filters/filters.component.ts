import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {COLORS} from "../../colors";

export interface Filter {
  color?: number
  enabled?: boolean
  name?: string
  score: [number, number]
  scorex: [number, number]
  goals: {
    goal: number
    start_time?: number
    end_time?: number
    differance?: number
  }[]
}


@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.sass']
})
export class FiltersComponent implements OnInit {
  colors = COLORS
  filters: Filter[] = []

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
    // this.addFilter()
    this.loadFilters()
  }

  addFilter() {
    let filter: Filter = {
      score: [2, 2],
      scorex: [3, 2],
      goals: [],
    }
    this.filters.push(filter)
    this.updateGoalCount(filter)
  }

  saveChanges() {
    this.api.post("/update-filters/", this.filters).subscribe(httpResponse => {
      this.loadFilters()
    }, error => {
      alert("Failed to save")
    })
  }

  loadFilters() {
    this.api.get("/filters/").subscribe(httpResponse => {
      let filters = httpResponse.body
      filters.forEach((u: { scorex: any; score: any; }) => {
        u.scorex = u.scorex || [u.score[0], u.score[1]]
      })
      this.filters = filters
    }, error => {
      alert("Failed to load filters")
    })
  }

  updateGoalCount(filter: Filter) {
    let count = filter.score[0] + filter.score[1]
    for (let i = filter.goals.length; i < count; i++) {
      filter.goals.push({
        goal: i,
        start_time: 0,
        end_time: 0,
        differance: 0,
      })
    }
    filter.goals = filter.goals.slice(0, count)
  }

  deleteFilter(filter: Filter) {
    this.filters = this.filters.filter(u => u != filter)
  }
}
